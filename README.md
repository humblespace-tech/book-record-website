# Book Record Website

A full-stack web application for managing and tracking your personal book collection with a global MongoDB database.

## Features

- **Add Books**: Record new books with title, author, ISBN, and other details
- - **Search & Filter**: Find books by title, author, or genre
  - - **Rating System**: Rate and review your books
    - - **Collection Statistics**: View stats about your reading habits
      - - **Responsive Design**: Works on desktop, tablet, and mobile devices
        - - **Cloud Database**: Data syncs across all your devices
         
          - ## Tech Stack
         
          - - **Frontend**: Next.js with React and TypeScript
            - - **Backend**: Node.js with Express
              - - **Database**: MongoDB Atlas (Global)
                - - **Deployment**: Vercel
                 
                  - ## Getting Started
                 
                  - ### Prerequisites
                  - - Node.js 16 or higher
                    - - npm or yarn
                      - - MongoDB Atlas account
                       
                        - ### Installation
                       
                        - 1. Clone the repository
                          2. 2. Install dependencies: `npm install`
                             3. 3. Create .env.local file with MongoDB connection string
                                4. 4. Run development server: `npm run dev`
                                   5. 5. Open http://localhost:3000
                                     
                                      6. ## Environment Variables
                                     
                                      7. Create a `.env.local` file:
                                      8. ```
                                         MONGODB_URI=your_mongodb_connection_string
                                         ```

                                         ## Deployment

                                         This project is deployed on Vercel. Push to main branch to auto-deploy.

                                         ## License

                                         MIT
