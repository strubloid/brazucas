// Script to remove "archived" status from the database
// Run this script with: node remove_archived_status.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DATABASE || 'brazucas';

async function removeArchivedStatus() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Update news items with archived status to rejected status
    const newsUpdateResult = await db.collection('news').updateMany(
      { archived: true },
      { 
        $set: { rejected: true, archived: false },
        $push: { statusHistory: { 
          status: 'rejected', 
          timestamp: new Date(), 
          note: 'Auto-converted from archived to rejected status' 
        }}
      }
    );
    
    console.log(`Updated ${newsUpdateResult.modifiedCount} news items from archived to rejected status`);

    // Update ads with archived status to rejected status
    const adsUpdateResult = await db.collection('advertisements').updateMany(
      { archived: true },
      { 
        $set: { rejected: true, archived: false },
        $push: { statusHistory: { 
          status: 'rejected', 
          timestamp: new Date(), 
          note: 'Auto-converted from archived to rejected status' 
        }}
      }
    );
    
    console.log(`Updated ${adsUpdateResult.modifiedCount} ads from archived to rejected status`);

    // Remove archived status from status system collection if it exists
    const statusSystemUpdateResult = await db.collection('statusSystem').updateMany(
      { 'status.code': 'archived' },
      { $set: { 'status.code': 'rejected', 'status.displayName': 'Rejeitado' } }
    );
    
    console.log(`Updated ${statusSystemUpdateResult.modifiedCount} status system entries`);

    console.log('Successfully removed archived status from database');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the update function
removeArchivedStatus().catch(console.error);
