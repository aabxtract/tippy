
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
;; random change 7f2801
;; random change 95357
;; random change 24f8f4
;; random change 39aa7d
;; random change aeebd2
;; random change 6a9fb1
;; random change 31a019
;; random change 47b3a7
;; random change b541f8
;; random change 1b3f73
;; random change 8cbfff
;; random change f7282b
;; random change 625e4d
;; random change 8c09bd
;; random change 2d7fbb
;; random change 766749
;; random change 3f4c38
;; random change 4872d5
;; random change 1e8e3a
;; random change 18b5c6
;; random change 11847c
;; random change 11e138
;; random change 25216c
;; random change 8fb508
;; random change 26d7ea
;; random change b70061
;; random change dcdf39
;; random change 7eebb9
;; random change 792d27
;; random change cc1f42
;; random change 40271f
;; random change 325b59
;; random change 895e5f
;; random change 31e8f8
;; random change d67a4a
;; random change ecd1d5
;; random change 11d6b4
;; random change c3cfd7
;; random change 467970
;; random change b16988
;; random change b1fac9
;; random change 3d4584
;; random change d1c49d
;; random change d9db81
;; random change cdd69
;; random change 73554a
;; random change 9d7dab
;; random change bfaaaf
;; random change 491306
;; random change b53d47
;; random change bfecc9
;; random change 5fc470
;; random change bab341
;; random change 726834
;; random change b3e452
;; random change 7ccf34
;; random change f8efd3
;; random change 232171
;; random change 62a953
;; random change eea658
;; random change 34e43
;; random change 59631d
;; random change b02f33
;; random change 962e80
;; random change e832e8
;; random change b1080c
;; random change 99cbb6
;; random change c082a
;; random change 6620a3
;; random change 1b3530
;; random change cd7910
;; random change 2ce17d
;; random change 84c52c
;; random change 85f823
;; random change 6b4f56
;; random change 73fda2
;; random change 87e91e
;; random change d7b6ed
;; random change 55d12
;; random change dfa871
;; random change 9d2b0f
;; random change b10d67
;; random change b08160
;; random change bb2982
;; random change a7e7fe
;; random change 6dff88
;; random change 943fea
;; random change 325d87
;; random change 851369
;; random change 6e0a03
;; random change 57c4e5
;; random change 3a9463
;; random change 6d2f29
;; random change f28af2
;; random change ce29e9
;; random change 7bf872
;; random change 7dab3
;; random change af6d92
;; random change 6702f7
;; random change f474f3
;; random change 69db7b
;; random change 60273b
;; random change e02823
;; random change 92291a
;; random change 13ae70
;; random change e7a95d
;; random change 14c131
;; random change 33a8cf
;; random change 459df6
;; random change cc1e2c
;; random change 92a5bd
;; random change eab5ca
;; random change f0f5fc
;; random change 507f9e
;; random change f39c23
;; random change bf98a1
;; random change 13086
;; random change 6c039
;; random change a4129a
;; random change a97617
;; random change 605f78
;; random change 68436c
;; random change 85c74a
;; random change 8c66a4
;; random change d4c7da
;; random change 8b2deb
;; random change 57cf57
;; random change 7d30fc
;; random change 2d3d43
;; random change d2a73c
;; random change 53485
;; random change a06622
;; random change 5442a5
;; random change aca08a
;; random change 137767
;; random change 10227f
;; random change 2951a6
;; random change d8d3ec
;; random change 15a4c1
;; random change 5ab664
;; random change 3cbd8c
;; random change 88267b
;; random change 78e259
;; random change 8b878a
;; random change ea3e7f
;; random change 368d58
;; random change 68ca7
;; random change 5664c6
;; random change c431e6
;; random change b416a3
;; random change a9cf5b
;; random change 2c95f8
;; random change 82c369
;; random change 6301f3
;; random change 293631
;; random change 81e589
;; random change d64338
;; random change a9824
;; random change c94755
;; random change 8e25f0
;; random change 751b33
;; random change e8abd1
;; random change d5921f
;; random change 51010c
;; random change 8031e1
;; random change 876e8c
;; random change 47c3f5
;; random change f65192
;; random change b18117
;; random change c11500
;; random change 3cd8d0
;; random change ee2831
;; random change c74b5d
;; random change 519478
;; random change 4dae5
;; random change 5ba7f2
;; random change b7de6
;; random change c368e
;; random change cdabba
;; random change 160935
;; random change 9b2ecd
;; random change 44e10f
;; random change 685ea9
;; random change b163e
;; random change a68048
;; random change 95fc7f
;; random change 23c155
;; random change f3691
;; random change fd2112
;; random change c5defd
;; random change c87c49
;; random change 6b959e
;; random change a66851
;; random change 55f99e
;; random change 520f1e
;; random change e18458
;; random change 2a57f9
;; random change 5b5240
;; random change cbd38a
;; random change def5
;; random change 7f540c
;; random change e98282
;; random change 980e41
;; random change 583ac5
;; random change 953f54
;; random change c41d45
;; random change 69b096
;; random change 78f8e1
;; random change 3ce270
;; random change d47368
;; random change c8ffd3
;; random change 957c6e
;; random change 22f490
;; random change 33e1e6
;; random change e6f6d9
;; random change 1a67ff
;; random change 52a665
;; random change cd0908
;; random change dc1b23
;; random change d9223c
;; random change 7010ac
;; random change 8805bf
;; random change dfb1b9
;; random change a62a71
;; random change a53ee1
;; random change b35544
;; random change 8d3ef4
;; random change ecb02e
;; random change 4d552e
;; random change 1cd3b7
;; random change b81dc
;; random change c2b548
;; random change 654070
;; random change b382c7
;; random change 119e67
;; random change 4081cf
;; random change 263e88
;; random change d6ea82
;; random change bb19f7
;; random change 22642b
;; random change e39eaa
;; random change dbd96d
;; random change 1b05fa
;; random change bbb920
;; random change ec6ca7
;; random change 8fc7af
;; random change 2165da
;; random change 84c821
;; random change 77448b
;; random change d6cc69
;; random change acc9df
;; random change 4818fe
;; random change 8d622a
;; random change b24c36
;; random change 498222
;; random change 3474b1
;; random change ab9ba3
;; random change ae7303
;; random change 1ce016
;; random change ff12e3
;; random change bc2a98
;; random change dba05e
;; random change b313b8
;; random change 981451
;; random change 1f3f82
;; random change 8ff959
;; random change c6bcbf
;; random change df3d36
;; random change fd9e18
;; random change e30574
;; random change 42e56a
;; random change 45fc57
;; random change 63745e
;; random change 7931be
;; random change 550c8c
;; random change 2dbbf9
;; random change eaef78
;; random change 3cf