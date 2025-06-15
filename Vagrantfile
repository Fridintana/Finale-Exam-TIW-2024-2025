Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"

  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.synced_folder "app", "/home/vagrant/app"

  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update && sudo apt-get -y upgrade

    # Install essential build tools
    sudo apt-get install -y build-essential libssl-dev curl

    # Install Node.js (version 18 LTS)
    # curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    # sudo apt-get install -y nodejs
    # Install Node.js (version 22 LTS)
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
    sudo apt-get install -y nodejs

    # Install Redis (and MongoDB)
    # sudo apt-get install -y redis-server #mongodb

    # Install Ruby (version 2.7 or greater)
    sudo apt-get install -y ruby-full

    # Optional: install the cf gem
    # sudo gem install cf || true
  SHELL
end