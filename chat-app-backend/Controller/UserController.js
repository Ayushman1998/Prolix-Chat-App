const express = require('express');
const bcrypt = require('bcrypt');
const { checkAuth } = require('../middleware');
const { cleanUpAndValidate } = require('../Utils/AuthUtils');
const UserModel = require('../Models/UserModel');

const auth = express.Router();

auth.get('/', (req, res) => {
    res.send({
        status: 200,
        message: "Connected Successfully"
    });
});

auth.get('/search', checkAuth, async (req, res) => {
    const { keyword } = req.query;
    const offset = req.query.offset || 0;
    const searcher = req.session.user.userId;

    if (!keyword || typeof (keyword) !== 'string') {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const dbUser = await UserModel.findUser({ searcher, keyword, offset });

        return res.send({
            status: 200,
            message: "Search completed",
            data: dbUser
        });

    } catch (error) {
        return res.send({
            status: 400,
            message: "Error Occured",
            error
        });
    }
});

auth.post('/register', async (req, res) => {

    const { name, username, password, email, profilePic } = req.body;

    // Validating data
    try {
        await cleanUpAndValidate({ name, username, password, email });
    } catch (error) {
        return res.send({
            status: 400, // for failed
            message: error
        });
    }

    // checking if already user exists
    try {
        await UserModel.verifyUsernameAndEmailExists({ username, email });
    } catch (error) {
        return res.send({
            status: 400, // for failed
            message: "Error Occured",
            error
        });
    }

    try {
        const user = new UserModel({
            name,
            username,
            password,
            email,
            profilePic
        });

        try {
            const dbUser = await user.registerUser();

            // Newsletter, Welcome email

            return res.send({
                status: 200,
                message: "Registration Successful",
                data: {
                    name: dbUser.name,
                    userId: dbUser._id,
                    email: dbUser.email,
                    username: dbUser.username,
                    profilePic: dbUser.profilePic
                }
            })
        } catch (error) {
            return res.send({
                status: 400, // for failed
                message: "Internal Error",
                error: error
            });
        }
    } catch (error) {
        return res.send({
            status: 400,
            message: "Invalid Data",
            error
        });
    }

});

auth.post('/login', async (req, res) => {

    const { loginId, password } = req.body;

    if (typeof (loginId) !== 'string' || typeof (password) !== 'string' || !loginId || !password) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {

        const dbUser = await UserModel.findUserWithLoginId(loginId);

        const isMatch = await bcrypt.compare(password, dbUser.password);
        
        if (!isMatch) {
            return res.send({
                status: 400,
                message: "Invalid Password",
            });
        }

        req.session.isAuth = true;
        req.session.user = {
            username: dbUser.username,
            email: dbUser.email,
            userId: dbUser._id
        }

        return res.send({
            status: 200,
            message: "Logged in successfully",
            data: {
                name: dbUser.name,
                _id: dbUser._id,
                email: dbUser.email,
                username: dbUser.username,
                profilePic: dbUser.profilePic
            }
        });

    } catch (error) {
        return res.send({
            status: 400,
            message: "Error Occured",
            error
        });
    }
});

auth.get('/logout',checkAuth, (req, res) => {

    try {
        req.session.destroy();
        res.clearCookie('connect.sid');

        return res.send({
            status: 200,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error Occured",
            error
        });
    }

    // req.session.destroy((error) => {
    //     if (error) {
    //         return res.send({
    //             status: 400,
    //             message: "Error Occured",
    //             error
    //         })

    //     } else {
    //         return res.send('Logged out successfully');
    //     }

    // });

});

module.exports = auth;