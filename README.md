# Didux.io Template Backend

To run this application you need to have npm installed.

# Creating RS256 keypair for the JWT

Create a 'jwt-keys' folder in the root directory of this project.
```mkdir jwt-keys```

When prompted for a passphrase `DON'T` add it.

Execute command for RS256 keypair generation. <br/>
```ssh-keygen -t rsa -b 4096 -m PEM -f ./jwt-keys/private.pem```

(Don't add passphrase) <br/>
```openssl rsa -in ./jwt-keys/private.pem -pubout -outform PEM -out ./jwt-keys/public.pem```

# Running the application

Start database 
```docker run --name DB_HOST --rm -h DB_HOST -e POSTGRES_PASSWORD=DB_PASSWORD -e POSTGRES_USER=DB_USER -e POSTGRES_DB=DB_NAME -p 5432:5432 -d postgres:9.6```

To run the application make sure to run tsc first. For development you can use an npm command to start a watcher that watches the file changes and creates a new build folder. For example start two terminals and use this command for a watcher:

```npm run watch```

And another terminal window to run the application:

```npm run start```


## User Powers

1 = Admin
100 = User
