/* eslint-disable no-undef */
import { createNotification } from '../components/notification.js'
const nameInput = document.querySelector('#name-input');
const phoneInput = document.querySelector('#phone-input');
const list = document.querySelector('#list');
const formBtn = document.querySelector('.form-btn');
const loader = document.querySelector('#loader');
const mainContainer = document.querySelector('#main-container');
const loadingScreen = document.querySelector('#loading-screen');
const form = document.querySelector('#form');


// regex
const PHONE_REGEX = /^[0](412|414|416|426|424|212)[0-9]{7}$/;
const NAME_REGEX = /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,15}\s){1}[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,15}$/;

// validaciones
let nameValidation = false;
let phoneValidation = false;
let miniNameValidation = false;
let miniPhoneValidation = false;


const inputValidation = (input, regexValidation) => {
    const infoText = input.parentElement.children[1];
    formBtn.disabled = nameValidation && phoneValidation ? false : true;
    if (input.value === '') {
        input.classList.remove('wrong');
        input.classList.remove('correct');
        infoText.classList.remove('show');
    } else if (regexValidation) {
        input.classList.add('correct');
        input.classList.remove('wrong');
        infoText.classList.remove('show');
    } else {
        input.classList.add('wrong');
        input.classList.remove('correct');
        infoText.classList.add('show');
    }
};
nameInput.addEventListener('input', () => {
    nameValidation = NAME_REGEX.test(nameInput.value);
    inputValidation(nameInput, nameValidation);
});
phoneInput.addEventListener('input', () => {
    phoneValidation = PHONE_REGEX.test(phoneInput.value);
    inputValidation(phoneInput, phoneValidation);
});

form.addEventListener('submit', async e => {
    e.preventDefault();
    formBtn.classList.add('hidden');
    loader.classList.remove('hidden');
    if (nameValidation && phoneValidation) {
        try {
            const { data } = await axios.post('/api/contacts', { contactname: nameInput.value, phone: phoneInput.value });
            const li = document.createElement('Li');
            li.id = data.id;
            li.className = 'contact-list';
            li.innerHTML = `
            <div class="icons">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="delete-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <div class="inputs">
                <input class="contact-list-input" type="text" value="${data.contactname}" readonly autocomplete="off">
                <input class="contact-list-input" type="text" value="${data.phone}" readonly autocomplete="off">
            </div>
            <span id="blade" class="blade hidden md:m-2.5 m-4 w-40 md:w-80">
            </span>
            <div class="icons">        
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="edit-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span class="updating hidden"></span>
            </div>
        `;
            list.append(li);
            nameInput.value = '';
            phoneInput.value = '';
            inputValidation(nameInput);
            inputValidation(phoneInput);
            nameValidation = false;
            phoneValidation = false;
            formBtn.classList.remove('hidden');
            loader.classList.add('hidden');
            formBtn.disabled = true;
        } catch (error) {
            formBtn.classList.remove('hidden');
            loader.classList.add('hidden');
            createNotification(true, 'Error del servidor, vuelve a intentarlo en otro momento.')
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 5000)
        }
    } else {
        formBtn.classList.remove('hidden');
        loader.classList.add('hidden');
        createNotification(true, 'Debes validar todos los campos.')
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000)
    }
});
list.addEventListener('click', async e => {
    // para eliminar el bloque de contacto
    if (e.target.closest('.delete-icon')) {
        const li = e.target.closest('li');
        const deleteBtn = li.children[0];
        const inputs = li.children[1];
        const blade = li.children[2];
        const editBtn = li.children[3];

        deleteBtn.classList.add('hide');
        inputs.classList.add('hide');
        editBtn.classList.add('hide');
        blade.classList.remove('hidden');
        try {
            await axios.delete(`/api/contacts/${li.id}`);
            li.remove();
        } catch (error) {
            deleteBtn.classList.remove('hide');
            inputs.classList.remove('hide');
            editBtn.classList.remove('hide');
            blade.classList.add('hidden');
            createNotification(true, 'No se ha podido eliminar el contacto. Error de conexión.')
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 5000)
        }

    }
    if (e.target.closest('.edit-icon') || e.target.querySelector('.edit-icon')) {
        const li = e.target.closest('li');
        const inputs = li.children[1];
        // selecciono el nombre
        const input = inputs.children[0];
        // selecciono el numero de telefono
        const phone = inputs.children[1];
        // selecciono el boton de editar
        const editIcon = e.target.closest('.edit-icon');
        const validation = () => {
            const editValidation = (miniInput, miniRegexValidation) => {
                if (miniRegexValidation) {
                    miniInput.classList.add('correct');
                    miniInput.classList.remove('wrong');
                    if (!input.classList.contains('wrong') && !phone.classList.contains('wrong')) {
                        editIcon.classList.remove('hide');
                    }
                } else {
                    miniInput.classList.remove('correct');
                    miniInput.classList.add('wrong');
                    editIcon.classList.add('hide');
                }
            };
            input.addEventListener('input', () => {
                miniNameValidation = NAME_REGEX.test(input.value);
                editValidation(input, miniNameValidation);
            });

            phone.addEventListener('input', () => {
                miniPhoneValidation = PHONE_REGEX.test(phone.value);
                editValidation(phone, miniPhoneValidation);
            });
            input.setAttribute('value', input.value);
            phone.setAttribute('value', phone.value);
        };
        if (editIcon.classList.contains('editando')) {
            editIcon.classList.remove('editando');
            const updating = editIcon.parentElement.children[1];
            validation();
            if (miniNameValidation) {
                updating.classList.remove('hidden');
                editIcon.classList.add('hide');
                try {
                    await axios.patch(`/api/contacts/${li.id}`, { contactname: input.value });
                    console.log('Name updated succesfully');
                    input.setAttribute('readonly', true);
                    phone.setAttribute('readonly', true);
                    input.classList.remove('wrong');
                    input.classList.remove('correct');
                    phone.classList.remove('wrong');
                    phone.classList.remove('correct');
                    editIcon.classList.remove('hide');
                    editIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />';
                    updating.classList.add('hidden');
                    miniNameValidation = false;
                } catch (error) {
                    createNotification(true, 'No se ha podido actualizar el nombre. Error de conexión.')
                    updating.classList.add('hidden');
                    editIcon.classList.remove('hide');
                    setTimeout(() => {
                        notification.classList.add('hidden');
                    }, 5000)
                }
            }
            if (miniPhoneValidation) {
                updating.classList.remove('hidden');
                editIcon.classList.add('hide');
                try {
                    await axios.patch(`/api/contacts/${li.id}`, { phone: phone.value });
                    console.log('Phone updated succesfully');
                    input.setAttribute('readonly', true);
                    phone.setAttribute('readonly', true);
                    input.classList.remove('wrong');
                    input.classList.remove('correct');
                    phone.classList.remove('wrong');
                    phone.classList.remove('correct');
                    editIcon.classList.remove('hide');
                    editIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />';
                    miniPhoneValidation = false;
                    updating.classList.add('hidden');
                } catch (error) {
                    createNotification(true, 'No se ha podido actualizar el número. Error de conexión.')
                    updating.classList.add('hidden');
                    editIcon.classList.remove('hide');
                    setTimeout(() => {
                        notification.classList.add('hidden');
                    }, 5000)
                }
            }
            editIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />';
        } else {
            const end = input.value.length;
            input.setSelectionRange(end, end);
            input.focus();
            editIcon.classList.add('editando');
            input.removeAttribute('readonly');
            phone.removeAttribute('readonly');
            validation();
            // simbolo de editando
            editIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />';
        }
    }
});
(async () => {
    try {
        // eslint-disable-next-line no-undef
        const { data } = await axios.get('/api/contacts', {
            withCredentials: true,
        });
        data.forEach(contact => {
            const li = document.createElement('Li');
            li.id = contact.id;
            li.className = 'contact-list';
            li.innerHTML = `
            <div class="icons">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="delete-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <div class="inputs">
                <input class="contact-list-input" type="text" value="${contact.contactname}" readonly autocomplete="off">
                <input class="contact-list-input" type="text" value="${contact.phone}" readonly autocomplete="off">
            </div>
            <span id="blade" class="blade hidden md:m-2.5 m-4 w-40 md:w-80">
            </span>
            <div class="icons">        
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="edit-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span class="updating hidden"></span>
            </div>
        `;
        list.append(li);
        });
        mainContainer.classList.remove('hidden');
        mainContainer.classList.add('flex');
        loadingScreen.classList.add('hidden');
    } catch (error) {
        console.log('error');
        loadingScreen.children[1].innerHTML = 'ERROR DEL SERVIDOR :(';
        window.location.pathname = '/login';
    }
})();