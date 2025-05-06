;; An on-chain counter that stores a count for each individual

;; Define a map data structure
(define-map counters principal uint)
(define-constant admin 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM) ;; INVALID principal, replace with a valid one
(define-constant max-count u1000)

;; Error codes
(define-constant ERR_COUNT_OVERFLOW u400)
(define-constant ERR_NOT_AUTHORIZED u403)

;; Function to retrieve the count for a given individual
(define-read-only (get-count (who principal))
  (default-to u0 (map-get? counters who))
)

;; Function to increment the count for the caller and to prevent overflow
(define-public (count-up)
  (let ((new-count (+ (get-count tx-sender) u1)))
    (asserts! (<= new-count max-count) (err ERR_COUNT_OVERFLOW))

    (map-set counters tx-sender new-count)
    (log-change "increment" new-count)
    (ok true)
  )
)

(define-public (count-down)
  (let ((current-count (get-count tx-sender)))
    (if (> current-count u0)
      (let ((new-count (- current-count u1)))
        (map-set counters tx-sender new-count)
        (log-change "decrement" new-count)
        (ok true)
      )
      ;; If the count is already zero, we cannot decrement further
      (err false)
    )
  )  
)

(define-public (reset-count)
  (let ((new-count u0))
    (map-set counters tx-sender new-count)
    (log-change "reset" new-count)
    (ok true)
  )
)

(define-public (get-my-count)
  (ok (get-count tx-sender))
)

(define-public (get-count-for (who principal))
  (ok (get-count who))
)

(define-private (log-change (action (string-ascii 20)) (new-count uint))
  (print {user: tx-sender, action: action, count: new-count})
)

(define-public (admin-set-count (user principal) (val uint))
  (begin
    (asserts! (is-eq tx-sender admin) (err ERR_NOT_AUTHORIZED))
    (map-set counters user val)
    (ok true)
  )
)

