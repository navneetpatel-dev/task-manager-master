const express = require('express')
const router = express.Router();
const Task = require('../modals/task')
const auth = require('../middleware/auth')

/* 
 =============
 CREATE A TASK 
 =============
*/
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)  
    } catch(err) {
        res.status(400).send(err.message)
    }
})


/* 
 =============
 READ ALL TASK 
 =============
*/

router.get('/tasks', auth, async (req, res) => {
    try {
        // const tasks = await Task.find({ owner: req.user._id})

        const match = {}
        const sort = {}

        if(req.query.completed) {
            match.completed = req.query.completed === 'true'
        }

        if(req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1]==='desc' ? -1 : 1
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.status(200).send(req.user.tasks) 
    } catch (error) {
        res.status(500).send(error.message)
    }
})

/* 
 ==================
 CREAT A TASK BY ID
 ==================
*/

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send('Tasks not found')
        }

        res.send(task)

    } catch (error) {
        res.status(500).send(error.message)
    }
})

/* 
 =============
 UPDATE A TASK 
 =============
*/
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const alowedToUpdate = ['description', 'email', 'completed']

    const isAllowed = updates.every((update) => alowedToUpdate.includes(update))

    if(!isAllowed) {
       return res.status(400).send("Invalid Updates")
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send("task not found")
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.status(200).send(task)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

/* 
 =============
 DELETE A TASK 
 =============
*/
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id :req.params.id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send("Not found")
        }  
        
        res.send(task)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router