FROM php:8.2-apache

# Install system dependencies and PHP PDO MySQL extension
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install dependencies
RUN composer install --no-dev --optimize-autoloader


# Create storage and bootstrap/cache directories if missing
RUN mkdir -p /var/www/html/storage/framework/views \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/cache \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Configure Apache DocumentRoot to point to /var/www/html/public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Custom entrypoint that binds Apache to the dynamic port Render inyecta via $PORT
COPY docker-apache-start.sh /usr/local/bin/docker-apache-start.sh
RUN chmod +x /usr/local/bin/docker-apache-start.sh

# Expose default port (Render lo reemplaza con su propio PORT)
EXPOSE 80

# Start Apache in foreground with dynamic port binding
ENTRYPOINT ["docker-apache-start.sh"]
CMD ["apache2-foreground"]
