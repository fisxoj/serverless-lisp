(defpackage my-cool-function
  (:use :cl)
  (:export #:hello
           #:goodbye))

(in-package :my-cool-function)

(defun aget (alist key)
  (cdr (assoc key alist :test #'string=)))


(defun get-name-from-body (event)
  (let* ((body (jojo:parse (aget event "body") :as :alist)))
    (aget body "name")))


(defun make-response (body &optional (status 200))
  (list
   (cons "statusCode" status)
   (cons "headers" (list
                    (cons "Content-Type" "application/json")))
   (cons "isBase64Encoded" :false)
   (cons "body" (jojo:to-json body :from :alist))))


(defun hello (event)
  (let ((name (get-name-from-body event)))
    (if name
        (make-response
         (list (cons "response" (format nil "Hello, ~a!" name))
               (cons "request-id" (cl-aws-lambda/runtime-interface:request-id-of cl-aws-lambda/runtime-interface:*context*))))
        (error "No name supplied!"))))


(defun goodbye (event)
  (let ((name (get-name-from-body event)))
    (if name
        (make-response
         (list (cons "response" (format nil "Goodbye, ~a!" name))
               (cons "request-id" (cl-aws-lambda/runtime-interface:request-id-of cl-aws-lambda/runtime-interface:*context*))))
        (error "No name supplied!"))))
