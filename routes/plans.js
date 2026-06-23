var express = require('express');
var router = express.Router();

const isLoggedIn = require('../middleware/auth');//from the isloggedin funtion

// const{GoogleGenerativeAI}=require('@google/generative-ai');
const { GoogleGenAI } = require('@google/genai');


require('dotenv').config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// const genAI= new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model=genAI.getGenerativeModel({model: 'gemini-2.0-flash'});//gemini mdel

const { getCollection } = require('../models/db');

router.get('/practice', isLoggedIn, function (req, res) {
    res.render('practice');
});

router.get('/meals', isLoggedIn, function (req, res) {
    res.render('meals');
});

router.get('/strength', isLoggedIn, function (req, res) {
    res.render('S&C');
});


router.post('/practice/generate', isLoggedIn, async function (req, res) {
    try {
        const { position, level, duration, days, players, preparing, focus, notes } = req.body;

        const prompt = `Create a soccer practice plan with the following deatils:
        -Position: ${position}
        -Skill Level: ${level}
        -Session length: ${duration}
        -Number of days: ${days}
        -Number of players in practice: ${players}
        -Preparing for: ${preparing}
        -Focus area: ${focus}
        -Additional notes: ${notes}
        Please provide a detailed and structured practice plan for the predicted ${days} the user wants it to be for.
        Return the plan as plain text only. No markdown, no asterisks, no symbols.
        Use this exact structure:

PRACTICE PLAN
-------------
Position: [position]
Level: [level]
Duration: [duration]
Days: [days]
Players: [players]

WARM UP
[warm up details]

MAIN DRILLS
[drill details]

COOL DOWN
[cool down details]`

        // const result=await model.generateContent(prompt);
        // const plan=result.response.text();
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const plan = result.text;

        res.render('practice', { plan });

    } catch (e) {
        console.error(e);
        let errorMsg = 'Error generating plan, please try again later.';
        if (e.status === 503) {
            errorMsg = 'Gemini is experiencing high demand. Please try again in a moment'
        }
        res.render('practice', { plan: errorMsg, formData: req.body });

    }
});


router.post('/meals/generate', isLoggedIn, async function (req, res) {
    try {
        const { goal, mealsPerDay, days, diet, notes } = req.body;

        const prompt = `Create a meal plan for a futbol/soccer player with the following details:
        -Goal: ${goal}
        -Meals per day: ${mealsPerDay}
        -Number of days: ${days}
        -Dietary restrictions(e.g alergies): ${diet};
        -Additional notes: ${notes};
        
        Please provide a detailed and well structured meal plan that satisfies all the player's needs.
        Return the plan as plain text only. No markdown, no asterisks, no symbols.
        Use this exact structure

        INGREDIENTS NEEDED
        [try to include sizes and amount for each]
        ---------------
        Proteins
        [main protein sources for the duration period]
        Carbs
        [main carb sources for the uration period]
        Vegetables + fruits
        [same format]
        Snacks+extra(spices or sauces)
        [same format]
        Extra details
        [same format]
        
        MEAL PLAN
        ------------
        Goal:[Goal]
        Duration:[days]
        Dietary restrictions:[diet]
        
        DAY 1
        Breakfast:[meal]
        Snack:[meal]
        Lunch:[meal]
        snack:[meal]
        dinner:[meal]

        DAY 2
        [continue same structure for each day]

        Nutrition tips
        [any relevant tips]
        `

        //const result = await model.generateContent(prompt);
        //const plan = result.response.text();
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const plan = result.text;

        res.render('meals', { plan });
    } catch (e) {
        console.error(e);
        res.render('meals', { plan: 'Error generating meal plan. Please try again later' });
    }
});

router.post('/strength/generate', isLoggedIn, async function (req, res) {
    try {
        const { goal, experience, daysPerWeek, equipment, notes } = req.body;

        const prompt = `Please create a strength and conditioning for a futbol/soccer player with the following details:
        -Goal: ${goal}
        -Experience level: ${experience}
        -Days per week: ${daysPerWeek}
        -Equipment available: ${equipment}
        -Additional notes: ${notes}

        Please provide a detailed and well structured strength and conditioning plan that satisfies all of the player's needs.
        Return the plan as plain text only. No markdown, no asterisks, no symbols.
Use this exact structure:

STRENGTH AND CONDITIONING PLAN
------------------------------
Goal: [goal]
Experience: [experience]
Days per week: [daysPerWeek]
Equipment: [equipment]

DAY 1
Warm Up: [exercises]
Main Session: [exercises with sets and reps]
Cool Down: [exercises]

DAY 2
[continue same structure for each day]

WEEKLY TIPS
[any relevant tips]
            `

        //const result = await model.generateContent(prompt);
        //const plan = result.response.text();
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const plan = result.text;

        res.render('S&C', { plan });


    } catch (e) {
        console.error(e);
        res.render('S&C', { plan: 'Error generating strength and conditioning plan. Please try again later.' });
    }
})


router.post('/save', isLoggedIn, async function(req, res) {
    try {
        const { type, plan } = req.body;
        const conn = getCollection('plans');
        await conn.insertOne({
            userId: req.session.user._id,
            type: type,
            plan: plan,
            createdAt: new Date()
        });
        res.redirect('/plans/dashboard');
    } catch(e) {
        console.error(e);
        res.redirect('/plans/practice');
    }
});

router.get('/dashboard', isLoggedIn, async function(req, res) {
    try {
        const conn = getCollection('plans');
        const { ObjectId } = require('mongodb');
        const savedPlans = await conn.find({ 
            userId: req.session.user._id.toString() 
        }).sort({ createdAt: -1 }).toArray();
        res.render('dashboard', { savedPlans });
    } catch(e) {
        console.error(e);
        res.render('dashboard', { savedPlans: [] });
    }
});

router.post('/delete/:id', isLoggedIn, async function(req, res) {
    try {
        const { ObjectId } = require('mongodb');
        const conn = getCollection('plans');
        await conn.deleteOne({ _id: new ObjectId(req.params.id) });
        res.redirect('/plans/dashboard');
    } catch(e) {
        console.error(e);
        res.redirect('/plans/dashboard');
    }
});



router.get('/view/:id', isLoggedIn, async function(req, res) {
    try {
        const { ObjectId } = require('mongodb');
        const conn = getCollection('plans');
        const savedPlan = await conn.findOne({ _id: new ObjectId(req.params.id) });
        res.render('view-plan', { savedPlan });
    } catch(e) {
        console.error(e);
        res.redirect('/plans/dashboard');
    }
});
module.exports = router;