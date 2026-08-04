export class Pool {
  query = jest.fn().mockImplementation((queryText: string, values: any[]) => {
    // Basic mock implementation for queries based on table names or query content
    if (queryText.includes('SELECT * FROM users WHERE id')) {
      return Promise.resolve({ rows: [{ id: values[0], email: 'mock@example.com', full_name: 'Mock User' }] });
    }
    if (queryText.includes('SELECT * FROM user_preferences WHERE user_id')) {
      return Promise.resolve({ rows: [{ favorite_flavors: ['spicy', 'sweet'], allergies: ['peanuts'] }] });
    }
    if (queryText.includes('INSERT INTO user_preferences')) {
      return Promise.resolve({ rows: [{ user_id: values[0], favorite_flavors: JSON.parse(values[1]), allergies: JSON.parse(values[2]) }] });
    }
    if (queryText.includes('SELECT * FROM restaurants WHERE id')) {
      return Promise.resolve({ rows: [{ id: values[0], name: 'Mock Restaurant' }] });
    }
    if (queryText.includes('SELECT * FROM restaurants WHERE name')) {
      return Promise.resolve({ rows: [{ id: 'r1', name: 'Mock Search Result' }] });
    }
    if (queryText.includes('SELECT * FROM dishes')) {
      return Promise.resolve({ rows: [{ id: 'mock_dish_id', name: 'Mock Dish', restaurant_id: values[0] }] });
    }
    if (queryText.includes('INSERT INTO posts')) {
      return Promise.resolve({ rows: [{ id: 'mock_post_id', user_id: values[0], post_type: values[1], content: values[2], video_url: values[3] }] });
    }
    if (queryText.includes('SELECT p.*, u.full_name as author_name')) {
      return Promise.resolve({ rows: [{ id: 'mock_post_id', user_id: 'user1', post_type: 'review', content: 'Mock post content', author_name: 'Mock Author' }] });
    }
    if (queryText.includes('INSERT INTO groups')) {
      return Promise.resolve({ rows: [{ id: 'mock_group_id', name: values[0], creator_id: values[1] }] });
    }
    if (queryText.includes('SELECT * FROM groups WHERE id = $1')) {
      return Promise.resolve({ rows: [{ id: values[0], name: 'Mock Group' }] });
    }
    if (queryText.includes('SELECT u.id, u.full_name')) {
      return Promise.resolve({ rows: [{ id: 'mock_user_id', full_name: 'Mock Member' }] });
    }
    if (queryText.includes('INSERT INTO group_members')) {
      return Promise.resolve({ rows: [] });
    }
    if (queryText.includes('CREATE TABLE IF NOT EXISTS user_swipes')) {
      return Promise.resolve({ rows: [] });
    }
    if (queryText.includes('INSERT INTO user_swipes')) {
      return Promise.resolve({ rows: [] });
    }
    if (queryText.includes('UPDATE users SET is_reviewer = TRUE')) {
      return Promise.resolve({ rows: [{ id: values[0], is_reviewer: true }] });
    }

    return Promise.resolve({ rows: [] });
  });

  connect = jest.fn();
  on = jest.fn();
  end = jest.fn();
}
