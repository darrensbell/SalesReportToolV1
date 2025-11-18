
{ pkgs, ... }: {
  # Using the stable-24.05 channel for nixpkgs.
  channel = "stable-24.05";
  
  # A list of packages to be installed in the environment.
  # We are including Node.js 20 and npm for our web application.
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];

  # Sets environment variables in the workspace.
  env = {
    # The API key for the Supabase project.
    SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZWJvZnV4cmRqamhsdmhnbG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTMxODgsImV4cCI6MjA2OTYyOTE4OH0.fjEEp99LcRZ8___7hFlmDDn28KQSHDOZ2hk47rhLdzM";
    # The project URL for the Supabase project.
    SUPABASE_PROJECT_URL = "https://peebofuxrdjjhlvhglmy.supabase.co";
  };

  idx = {
    # A list of VS Code extensions to be installed.
    extensions = [
      # An extension for code linting.
      "dbaeumer.vscode-eslint"
    ];

    # Configuration for the web preview.
    previews = {
      enable = true;
      previews = {
        web = {
          # The command to start the development server.
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          # The manager for the web preview.
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks.
    workspace = {
      # Runs when a workspace is first created.
      onCreate = {
        # Installs the npm dependencies.
        npm-install = "npm install";
      };
      # Runs when the workspace is (re)started.
      onStart = {
        # Starts the development server.
        dev-server = "npm run dev";
      };
    };
  };
}
