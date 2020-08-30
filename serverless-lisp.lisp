;; (paren6:import (spawn-sync) "child_process")
;; (paren6:import ((:default fs)) "fs")

(defvar fs (require "fs"))
(defvar path (require "path"))
(defvar spawn-sync (ps:@ (require "child_process") spawn-sync))


(paren6:defconstant6 +lisp-runtime+ "lisp")

(paren6:defconstant6 +provided-runtime+ "provided")

(paren6:defconstant6 +default-docker-image+ "quay.io/fisxoj/cl-lambda-builder")

(paren6:defconstant6 +default-docker-tag+ "ba54651")

(paren6:defconstant6 +no-output-capture+ (ps:create "stdio" (list "ignore" (ps:@ process stdout) (ps:@ process stderr))))


(defun find-asd-name (path)
  (dolist (filename ((ps:@ fs readdir-sync) path))
    (unless (= (ps:chain filename (index-of ".asd")) -1)
      (return (ps:chain filename (slice 0 (- (length filename) (length ".asd"))))))))


(defun undefined-p (value)
  (ps:=== (ps:typeof value) "undefined"))


(paren6:defclass6 (-serverless-lisp-plugin)
    (defun constructor (init-serverless init-options)
      (let ((build-fn (ps:chain this build (bind this))))
        (with-slots (serverless options hooks src-dir) this
          (setf serverless init-serverless
                options    init-options
                hooks      (ps:create "before:package:createDeploymentArtifacts" build-fn
                                      "before:deploy:function:packageFunction" build-fn
                                      "before:offline:start" build-fn
                                      "before:offline:start:init" build-fn)
                src-dir    (or (ps:@ this serverless config service-path)))))
      (values))

  (defun functions ()
    (if (not (undefined-p (ps:@ this options function)))
        (list (ps:@ this options function))
        (ps:chain this serverless service (get-all-functions))))

  (defun build ()
    (ps:chain this (log "Building shared function binary..."))

    (setf (ps:@ this serverless service package exclude-dev-dependencies) ps:false)

    (spawn-sync (ps:chain this (get-docker-binary))
                (ps:chain this (get-docker-args))
                ;; +no-output-capture+
                )

    (ps:chain this
              (functions)
              (for-each (paren6:=> (function-name)
                                   (ps:chain this (log "Wiring up function: " function-name))
                                   (let* ((fun (ps:chain this serverless service (get-function function-name)))
                                          (runtime (or (ps:@ fun runtime)
                                                       (ps:@ this serverless service provider runtime))))

                                     (when (ps:=== runtime +lisp-runtime+)
                                       (setf (ps:@ fun package) (or (ps:@ fun package)
                                                                    (ps:create))
                                             (ps:@ fun package artifact) (ps:chain path (join (ps:@ this src-dir) "function.zip"))
                                             (ps:@ fun runtime) +provided-runtime+))))))

    (when (ps:=== (ps:@ this serverless service provider runtime) +lisp-runtime+)
      (setf (ps:@ this serverless service provider runtime) +provided-runtime+)))

  (defun log (&rest args)
    (apply (ps:@ this serverless cli log) args))

  (defun get-docker-binary ()
    (or (ps:@ process env "SLS_DOCKER_CLI") "podman"))

  (defun get-docker-args ()
    (list "run"
          "--rm"
          "-it"
          "-v" (ps:chain (list "/home/fisxoj/quicklisp/local-projects" "/root/quicklisp/local-projects" "Z") (join ":"))
          "-v" (ps:chain (list (ps:@ this src-dir) "/work" "Z") (join ":"))
          "-e" (ps:chain (list "LAMBDA_SYSTEM_NAME" (find-asd-name (ps:@ this src-dir))) (join "="))
          (ps:chain (list +default-docker-image+ +default-docker-tag+) (join ":")))))


(paren6:export-default -serverless-lisp-plugin)
