const contactRouter = require('express').Router();
const Contact = require('../models/contact');

contactRouter.get('/', async (request, response) => {
    const user = request.user;
    const contacts = await Contact.find({ user: user.id });
    return response.status(200).json(contacts);
});
contactRouter.post('/', async (request, response) => {
    const user = request.user;
    const { contactname, phone } = request.body;
    const newContact = new Contact({
        contactname,
        phone,
        user: user._id,
    });
    const savedContact = await newContact.save();
    // revisar esto
    user.contacts = user?.contacts?.concat(savedContact._id);
    await user.save();
    return response.status(201).json(savedContact);
});
contactRouter.delete('/:id', async (request, response) => {
    const user = request.user;
    await Contact.findByIdAndDelete(request.params.id);

    user.contacts = user?.contacts?.filter(contact => contact.id !== request.params.id);
    return response.sendStatus(204);
});
contactRouter.patch('/:id', async (request, response) => {
    const { contactname } = request.body;

    await Contact.findByIdAndUpdate(request.params.id, { contactname });
    return response.sendStatus(200);
});
contactRouter.patch('/:id', async (request, response) => {
    const { phone } = request.body;

    await Contact.findByIdAndUpdate(request.params.id, { phone });
    return response.sendStatus(200);
});

module.exports = contactRouter;