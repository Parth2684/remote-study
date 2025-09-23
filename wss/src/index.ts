
import dotenv from 'dotenv';
dotenv.config();

import { ChatServer } from './server';


// Start the server
const server = new ChatServer();

export default server;