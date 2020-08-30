(defpackage my-cool-function
  (:use :cl)
  (:export #:hello))

(in-package :my-cool-function)

(defun hello (event)
  (let ((name (cdr (assoc "name" event :test #'string=))))
    (if name
        (list (cons "response" (format nil "Hello, ~a!" name))
              (cons "request-id" (cl-aws-lambda/runtime-interface:request-id-of cl-aws-lambda/runtime-interface:*context*)))
	(error "No name supplied!"))))
