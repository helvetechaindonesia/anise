FROM php:8.3-cli-alpine

# Install PostgreSQL dev dependencies and PHP extensions
RUN apk add --no-cache postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql

WORKDIR /var/www/html

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
