import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        full_name VARCHAR(255),
        is_reviewer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        favorite_flavors JSONB,
        allergies JSONB,
        dietary_restrictions JSONB,
        hated_dishes JSONB
    );

    CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        location JSONB, 
        geohash VARCHAR(50),
        delivery_links JSONB,
        is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS dishes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2),
        image_url TEXT,
        ingredients JSONB,
        embedding JSONB
    );

    CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
        post_type VARCHAR(50),
        video_url TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255),
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS group_members (
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS group_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS group_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'PENDING',
        selected_restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
        total_amount DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS group_order_participants (
        order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (order_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS group_order_votes (
        order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
        PRIMARY KEY (order_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS group_order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
        quantity INT DEFAULT 1,
        price DECIMAL(10,2)
    );

    CREATE TABLE IF NOT EXISTS user_swipes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
        action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'skip')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS user_swipes_user_created_idx ON user_swipes (user_id, created_at DESC);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS user_swipes CASCADE;
    DROP TABLE IF EXISTS group_order_items CASCADE;
    DROP TABLE IF EXISTS group_order_votes CASCADE;
    DROP TABLE IF EXISTS group_order_participants CASCADE;
    DROP TABLE IF EXISTS group_orders CASCADE;
    DROP TABLE IF EXISTS group_messages CASCADE;
    DROP TABLE IF EXISTS group_members CASCADE;
    DROP TABLE IF EXISTS groups CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS dishes CASCADE;
    DROP TABLE IF EXISTS restaurants CASCADE;
    DROP TABLE IF EXISTS user_preferences CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
}
