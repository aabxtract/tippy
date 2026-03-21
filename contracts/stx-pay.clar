;; STX Pay - Smart Contract
;; A utility contract for single sends, bulk sends, and personal tip jars.

;; Constants
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-FUNDS (err u101))
(define-constant ERR-EMPTY-LIST (err u102))
(define-constant ERR-NOT-FOUND (err u103))
(define-constant CONTRACT-OWNER tx-sender)

;; Data Maps
;; Tracks total tips ever received by an address (lifetime volume)
(define-map total-tips-received principal uint)

;; Tracks current withdrawable balance in the tip jar
(define-map tip-jar-balance principal uint)

;; Tracks if an address has registered a tip jar
(define-map registered-jars principal bool)

;; --- Read-Only Functions ---

;; Get lifetime tips received by an address
(define-read-only (get-total-tips (who principal))
  (default-to u0 (map-get? total-tips-received who))
)

;; Get current withdrawable balance in the tip jar
(define-read-only (get-jar-balance (who principal))
  (default-to u0 (map-get? tip-jar-balance who))
)

;; Check if a tip jar is registered
(define-read-only (is-jar-registered (who principal))
  (default-to false (map-get? registered-jars who))
)

;; Helper to extract amount from recipient tuple
(define-read-only (get-amount (item { to: principal, amount: uint }))
  (get amount item)
)

;; --- Private Helpers ---

;; Internal function to handle bulk transfers
;; Note: If one transfer fails (e.g. insufficient funds), the whole bulk send reverts.
(define-private (bulk-send-helper (item { to: principal, amount: uint }) (previous-result (response bool uint)))
  (begin
    (try! previous-result)
    (stx-transfer? (get amount item) tx-sender (get to item))
  )
)

;; --- Public Functions ---

;; 1. SINGLE SEND
;; Sends STX from caller to a single recipient and emits a print event.
(define-public (send-stx (recipient principal) (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender recipient))
    (print { action: "single-send", sender: tx-sender, recipient: recipient, amount: amount })
    (ok true)
  )
)

;; 2. BULK SEND
;; Accepts a list of recipient/amount tuples and executes transfers sequentially.
;; Maximum 200 recipients per transaction.
(define-public (bulk-send (recipients (list 200 { to: principal, amount: uint })))
  (let
    ((total-amount (fold + (map get-amount recipients) u0)))
    (begin
      (asserts! (> (len recipients) u0) ERR-EMPTY-LIST)
      ;; Execute transfers using a fold to propagate errors
      (try! (fold bulk-send-helper recipients (ok true)))
      (print { action: "bulk-send", sender: tx-sender, total-recipients: (len recipients), total-amount: total-amount })
      (ok true)
    )
  )
)

;; 3. TIP JAR FUNCTIONS

;; Register a tip jar for the caller
(define-public (register-tip-jar)
  (begin
    (map-set registered-jars tx-sender true)
    (ok true)
  )
)

;; Tip a registered address
;; STX is transferred from the tipper to the contract (Escrow)
(define-public (tip (recipient principal) (amount uint))
  (let
    (
      (current-total (get-total-tips recipient))
      (current-balance (get-jar-balance recipient))
    )
    (begin
      (asserts! (is-jar-registered recipient) ERR-NOT-FOUND)
      ;; Transfer STX to the contract
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      ;; Update lifetime volume
      (map-set total-tips-received recipient (+ current-total amount))
      ;; Update withdrawable balance
      (map-set tip-jar-balance recipient (+ current-balance amount))
      (print { action: "tip", tipper: tx-sender, recipient: recipient, amount: amount })
      (ok true)
    )
  )
)

;; Withdraw tips from your own jar
(define-public (withdraw-tips)
  (let
    (
      (owner tx-sender)
      (balance (get-jar-balance owner))
    )
    (begin
      (asserts! (> balance u0) ERR-INSUFFICIENT-FUNDS)
      ;; Transfer from contract back to the owner
      (try! (as-contract (stx-transfer? balance tx-sender owner)))
      ;; Reset balance for the owner
      (map-set tip-jar-balance owner u0)
      (print { action: "withdraw", recipient: owner, amount: balance })
      (ok true)
    )
  )
)
