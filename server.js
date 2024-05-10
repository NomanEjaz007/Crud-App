const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/crud')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    name: String,
    age: Number
});

const userModel = mongoose.model("users", UserSchema);

app.get("/getUsers", async (req, res) => {
    try {
        const { name, age } = req.query;
        const query = {};
        if (name) query.name = name;
        if (age) query.age = parseInt(age);
        const users = await userModel.find(query); 
        res.json(users);
    } catch (error) {   
        res.status(500).json({ message: error.message });
    }
});


app.post("/addUser", async (req, res) => {
    try {
        const { name, age } = req.body;
        if (!name || age === undefined) {
            return res.status(400).json({ message: "Name and age are required" });
        }
        if (typeof age !== 'number' || age < 0) {
            return res.status(400).json({ message: "Age must be a non-negative number" });
        }
        const newUser = new userModel({ name, age });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Add User Error:", error); 
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.put("/updateUser/:id", async (req, res)=>{
    try{
        const {id} = req.params;
        const {name, age} = req.body;

        if( name === undefined && age === undefined){
            return res.status(400).json({message: "No updates provided"});

        }

        const updates ={};
        if(name  !== undefined) updates.name = name;
        if(age  !== undefined) updates.age = age;


        const updatedUser = await userModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(updatedUser)
    }
    catch(error){
        console.log('Update User error', error);
        res.status(500).json({message:"Interal Server Error"});
    }
})

app.delete("/deleteUsers/:id", async (req, res)=>{
    try {
        const {id} = req.params;

        const deleteUsers = await userModel.findByIdAndDelete(id);
        if(!deleteUsers){
            return res.status(404).json({message: "User Not Found"});
        }
        res.status(204).json();
    } catch (error) {
        console.error("Delete User Error", error);
        res.status(500).json({message:"Internal Server Error"});

    }
})

app.listen(3000, () => {
    console.log("Server is running");
});
