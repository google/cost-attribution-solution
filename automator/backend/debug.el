(dap-register-debug-template
 "backend"
 (list :type "python"
       :args ""
       :cwd nil
       :module nil
       :env '(("SCOPE" . "projects/tag-automator-app"))
       :program "main.py"
       :request "launch"
       :name "Backend App"))
