# RAISEit - Auction Platform

RAISEit is a web application where teams compete in auction-style challenges. This platform allows:
- Creating auctions with custom player lists, budgets, and team limits
- Joining auctions using invitation codes
- Real-time bidding on players
- Tracking team progress and funds

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

- **Authentication System**: Secure user accounts
- **Create Auctions**: Add players with custom prices
- **Auction Codes**: Join specific auctions with unique codes
- **Budget Management**: Each auction creator can set bidder budgets
- **Team Limits**: Set maximum players per team
- **Bidding History**: Track all bids for transparency

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