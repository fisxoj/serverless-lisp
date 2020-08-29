(defsystem my-cool-function
  :defsystem-depends-on ("cl-aws-lambda/asdf")
  :class :lambda-system
  :components ((:file "hello")))
