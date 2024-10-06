import request from 'supertest';
import { app, server } from '../server.js'; // Adjust the path if necessary
import sqlite3 from 'sqlite3';

let db;

beforeAll((done) => {
    // Initialize the database connection
    db = new sqlite3.Database('./tasks.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        done();
    });
});

afterAll((done) => {
    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        // Close the server
        server.close(done);
    });
});

describe('API Endpoints', () => {
    it('should fetch all tasks', async () => {
        const response = await request(app).get('/tasks');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should add a new task', async () => {
        const newTask = { text: 'Test task', date: '2023-10-01' };
        const response = await request(app).post('/tasks').send(newTask);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.text).toBe(newTask.text);
    });

    it('should update a task', async () => {
        const newTask = { text: 'Task to update', date: '2023-10-01' };
        const postResponse = await request(app).post('/tasks').send(newTask);
        const taskId = postResponse.body.id;

        const updatedTask = { text: 'Updated task', date: '2023-10-02', completed: false };
        const response = await request(app).put(`/tasks/${taskId}`).send(updatedTask);
        expect(response.status).toBe(200);
        expect(response.body.text).toBe(updatedTask.text);
    });

    it('should delete a task', async () => {
        const newTask = { text: 'Task to delete', date: '2023-10-01' };
        const postResponse = await request(app).post('/tasks').send(newTask);
        const taskId = postResponse.body.id;

        const response = await request(app).delete(`/tasks/${taskId}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task deleted');
    });
});
