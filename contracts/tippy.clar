
;; Tippy - "Buy Me a Coffee" Style Tipping Contract
;; This contract allows users to set up a profile and receive tips with messages.

;; Constants
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-REGISTERED (err u405))

;; Data Maps
;; Stores user profile information
(define-map profiles 
    principal 
    { 
        name: (string-ascii 50), 
        bio: (string-ascii 200),
        price: uint ;; default "coffee" price in microstacks
    }
)

;; Stores tipping statistics
(define-map stats 
    principal 
    { 
        total-received: uint,
        total-tips: uint
    }
)

;; --- Read-Only Functions ---

;; Get a user's profile
(define-read-only (get-profile (who principal))
    (map-get? profiles who)
)

;; Get a user's stats
(define-read-only (get-stats (who principal))
    (default-to { total-received: u0, total-tips: u0 } (map-get? stats who))
)

;; --- Public Functions ---

;; Setup or Update your Tippy Profile
;; This is what "creates" the user's presence for their link.
(define-public (set-profile (name (string-ascii 50)) (bio (string-ascii 200)) (price uint))
    (begin 
        (map-set profiles tx-sender { name: name, bio: bio, price: price })
        (ok true)
    )
)

;; Tip a user (Buy them a coffee)
;; This transfers STX DIRECTLY to the recipient for immediate use.
;; Includes an optional message (emitted via print).
(define-public (tip (recipient principal) (amount uint) (message (string-ascii 100)))
    (let
        (
            (current-stats (get-stats recipient))
        )
        (begin
            ;; Ensure the recipient has a profile
            (asserts! (is-some (get-profile recipient)) ERR-NOT-FOUND)
            
            ;; Execute the direct transfer
            (try! (stx-transfer? amount tx-sender recipient))
            
            ;; Update statistics
            (map-set stats recipient {
                total-received: (+ (get total-received current-stats) amount),
                total-tips: (+ (get total-tips current-stats) u1)
            })
            
            ;; Emit a social event for the UI to pick up
            (print { 
                action: "tip", 
                from: tx-sender, 
                to: recipient, 
                amount: amount, 
                message: message 
            })
            
            (ok true)
        )
    )
)

;; random change 599292
;; random change 4fec6e
;; random change ccaaae
;; random change e5de23
;; random change 84c598
;; random change 6f2991
;; random change 2327f
;; random change 499b19
;; random change 771234
;; random change 7fbb18
;; random change 329eba
;; random change 442db1
;; random change 426e6a
;; random change c0beea
;; random change 25d6db
;; random change 2010ed
;; random change 35d856
;; random change 539d36
;; random change 5885e6
;; random change a14d00
;; random change 74df22
;; random change 9bf826
;; random change 940fac
;; random change f36fe5
;; random change 4d84d0
;; random change d6847f