#!/bin/sh
set -e

# Render inyecta el puerto HTTP en la variable PORT, contenedor Docker.
PORT="${PORT:-80}"

# Reconfigurar Apache para escuchar en el puerto dinámico
sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/\\*:80/\\*:${PORT}/g" /etc/apache2/sites-available/0000-default.conf

exec apache2-foreground