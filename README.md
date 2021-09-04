# StartApp-Authentication :earth_americas: :lock: :key:
## Script para crear Tabla Users
~~~
CREATE TABLE users
(id BIGSERIAL PRIMARY KEY NOT NULL,
name VARCHAR(200) NOT NULL,
email VARCHAR(200) NOT NULL,
password VARCHAR(200) NOT NULL,
UNIQUE (email));
~~~
## Comando para instalar packetes
npm install  
## Comando para correr aplicacion
npm run dev  --Comienza a escuchar en el puerto 4000--
