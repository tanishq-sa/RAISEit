# RAISEit - Auction Platform

RAISEit is a web application where teams compete in auction-style challenges. This platform allows:
- Creating auctions with custom player lists, budgets, and team limits
- Joining auctions using invitation codes
- Real-time bidding on players
- Tracking team progress and funds
- Global auction timing system
- Admin controls for auction management

## Setup Instructions

### 1. Prerequisites

- Node.js (v14.0 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd raiseit
npm install
# or
yarn install
```

### 3. MongoDB Configuration

Create a `.env.local` file in the root directory with your MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/raiseit
```

For production with MongoDB Atlas, use:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/raiseit?retryWrites=true&w=majority
```

### 4. Running the Application

Development mode:

```bash
npm run dev
# or
yarn dev
```

Production build:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

### 5. Using the Application

1. **Registration/Login**: Create an account or log in
2. **Create Auction**: Set up an auction with players, rules, and budget
3. **Share Code**: Share the generated invitation code with participants
4. **Join Auction**: Participants join using the invitation code
5. **Bidding**: Bid on players as they become available

## Features

### Core Features
- **Authentication System**: Secure user accounts with JWT
- **Create Auctions**: Add players with custom prices and images
- **Auction Codes**: Join specific auctions with unique codes
- **Budget Management**: Each auction creator can set bidder budgets
- **Team Limits**: Set maximum players per team
- **Bidding History**: Track all bids for transparency
- **Real-time Updates**: Live bidding and auction status updates

### Auction Management
- **Start Auction**: Admin can start the auction when all bidders are ready
- **Global Timer**: Server-side countdown for bidding on each player
- **Auto-Complete**: Automatic player assignment when timer ends
- **End Auction**: Admin can end auction and delete it after completion
- **Team Formation**: Automatic team creation based on successful bids

### Player Management
- **Player Status**: Track player status (pending, sold, unsold)
- **Player Details**: Store player name, base price, and image
- **Bid Tracking**: Record winning bids and team assignments
- **Unsold Players**: Handle unsold players appropriately

### Admin Controls
- **Auction Creation**: Set up auction parameters and rules
- **Player Management**: Add/remove players from auction
- **Auction Control**: Start, pause, and end auctions
- **Team Oversight**: Monitor team formations and budgets
- **Auction Cleanup**: Delete completed auctions

### User Features
- **Team Dashboard**: View owned players and remaining budget
- **Bid Placement**: Place bids within time limit
- **Auction Joining**: Join auctions via invitation code
- **Real-time Updates**: See live auction status and results

## MongoDB Schema

The application uses three main collections:

1. **Users**: User accounts and owned players
2. **Auctions**: Auction details, rules, and player lists
3. **Bids**: Bid history for all auctions

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Authentication**: Custom auth with JWT
- **Real-time Updates**: Server-side events and WebSocket

## Future Enhancements

1. **Enhanced Timer System**
      - Pause/resume functionality
   - Visual countdown timer

2. **Advanced Team Management**
   - Team statistics and analytics
   - Player performance tracking
   - Team comparison features

3. **Improved Admin Controls**
   - Bulk player import
   - Advanced auction settings
   - Real-time auction monitoring

4. **User Experience**
   - Mobile-responsive design
   - Dark mode support
   - Enhanced notifications

5. **Security Features**
   - Rate limiting
   - Advanced authentication
   - Audit logging

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 