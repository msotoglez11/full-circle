Full Circle
-----------
Full Circle is an AI powered soccer training app that generates specific and tailored practice plans, meal plans and strength & conditioning plans based on the user's specifications. Uses Gemini API to ask for a detailed and structured plan which will be sent back to the application. The user is then able to view the plan, and if they like it they are able to save it. Which will be saved in the plans schema in MongoDB and using sessions, will be loaded on to dashboard once your user.session is active.

Features
---------
- User signup and login with secure password hashing, salt will also be kept in user schema in MongoDB to allow password check/validation
-There is a session-based authentication to protect pages, isLoggedIn
- AI generated practice plans, meal plans and strength & conditioning plans- will depend on the API usage and also Gemini demand at the time. If Gemini demand usage is high, will trigger an error to try later
- Able to save plans to personal dashboard
- Able to view plans after generating and after saving on dashboard
- Able to delete saved plans- which will delete from db too
- Duplicate email check on signup, will show on url if email already in use

How to run the server
---------------------
1. Clone repo: https://github.com/msotoglez11/full-circle.git
2. Install dependencies: npm install
3. Create .env file in root folder with:
ATLAS_URI=your_own_mongodb_connection_string
SESSION_SECRET=your_session_secret
GEMINI_API_KEY=your_gemini_api_key
4. Start the server: npm start
5. Open browser and go to http://localhost:3000

API 
----
This uses the Google Gemini API, the gemini-2.5-flash model to generate all of the AI plans.
At first I was trying to use 1.5 and 2.0 but were causing problems with the API since I think their services have been terminated.
- Package @google/genai


MongoDb SChema
--------------
The app has two main collections, users and plans
Users
-----
Each document(object) in the collection stores:
format= field|type|description
- name|string|username
- email|string|unique email for each user
- password|string|hashed password
- salt|string| salt needed for password hashing and password checking

Plans
-----
- userId|String|ID of the user who saved the plan
- type|string|the type of plan(meal, strength, practice)
- plan|string|This is the full AI generated text
- createdAt|Date|Date plan was saved


Final submission
---------------
- Github repo: https://github.com/msotoglez11/full-circle
- live app: https://full-circle-y88o.onrender.com/

Test account: 
email: mig2@gmail.com
password:123
