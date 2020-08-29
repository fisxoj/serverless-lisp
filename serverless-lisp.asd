(defsystem serverless-lisp
  :defsystem-depends-on ("asdf-linguist")
  :depends-on ("parenscript"
               "paren6")
  :components ((:parenscript "serverless-lisp"
                :output "index")))
