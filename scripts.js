const Modal = {
    open() {
        //Abrir Modal
        //Adicionar class active no modal
        document.querySelector('.modal-overlay.save')
        .classList.add('active')

    },
    close() {
        document.querySelector('.modal-overlay.active')
        .classList.remove('active')
    },
    openEdit(index){
        // Abrir modal mult
        // Adicionar a class active ao modal
        // transaction=Transaction.all[index]
        Form.setValuesForEdit(index, Transaction.all[index])
        document
            .querySelector('.modal-overlay.edit')
            .classList.add('active')
    },
    closeEdit() {
        document.querySelector('.modal-overlay.edit')
        .classList.remove('active')
    }
}

const Id = {
    get() {
        return JSON.parse(localStorage.getItem("id")) ||
        [];
    },

    set(id) {
        localStorage.setItem("id", 
        JSON.stringify(id++));
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
        [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", 
        JSON.stringify(transactions));
    }
}

const Transaction = {

    all: Storage.get(),

    cont: Id.get(),

    //adicionar Transação
    add(transaction) {
        transaction.id = Transaction.cont++;
        Id.set(Transaction.cont);
        Transaction.all.push(transaction);
        
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    edit(transaction, index) {
        //atualizar os dados
        
        for(let i = 0; i < Transaction.all.length; i++){
            if(Transaction.all[i].id == transaction.id){
                // Transaction.all[i] = transaction;
                Transaction.all[i].id = transaction.id;
                Transaction.all[i].description = transaction.description, 
                Transaction.all[i].amount = transaction.amount;
                Transaction.all[i].date = transaction.date;
                console.log("Atualizado!");
            }
        }
        App.reload();
    },

    //somar as entradas
    incomes() {
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    //somar as saidas
    expanses() {
        let expanse = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expanse += transaction.amount;
            }
        })
        return expanse;
    },

    //clacular o total
    total() {
        return Transaction.incomes() + Transaction.expanses();
    }
}

//Substituir os dados do HTML com os dados do JS
const DOM = {
    transactionsContainer:document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        
        DOM.transactionsContainer.appendChild(tr)
        
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount >= 0 ? "income" :
        "expanse"

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
            <td>
                <img onclick="Modal.openEdit(${index})" src="./assets/edit.svg" alt="Editar Transação">
            </td>
        `
        return html;
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes());

        document
            .getElementById('expanseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expanses());
        
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total());

    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatAmount(value) {
        value = value * 100;

        return value;
    },

    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
        
    },

    formatDateModal(date) {
        console.log(date)
        const splittedDate = date.split("/");
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
        
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g,"");

        value = Number(value)/100;

        value = value.toLocaleString("pt-BR", {
            style:"currency",
            currency:"BRL"
        });

        return signal + value;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    idE: document.querySelector('input#id'),
    descriptionE: document.querySelector('input#updateDescription'),
    amountE: document.querySelector('input#updateAmount'),
    dateE: document.querySelector('input#updateDate'),

    getValues(formType) {
        if(formType == 'edit'){
            return {
                id: Form.idE.value,
                description: Form.descriptionE.value,
                amount: Form.amountE.value,
                date: Form.dateE.value
            }
        }
        else {
            return {
                description: Form.description.value,
                amount: Form.amount.value,
                date: Form.date.value
            }
        }
    },

    setValues(transaction) {
        description: transaction.description;
        amount: transaction.amount;
        date: transaction.date;
    },

    //setar os dados da transação no modal de editar
    setValuesForEdit(index, transaction) {
        // transaction.formatValues();
        document
            .getElementById('updateDescription')
            .value = transaction.description;
        document
            .getElementById('id').value = transaction.id;
        document
            .getElementById('updateAmount')
            .value = transaction.amount/100;
        document
            .getElementById('updateDate')
            .value = Utils.formatDateModal(transaction.date);
    },

    //verificar se todas as informações foram preenchidas
    validateFields(formType) {
        if(formType == 'edit'){
            const { id, description, amount, date } = Form.getValues(formType);

            console.log(id, description, amount, date)
        
            if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ){
                throw new Error("Por favor, preencha todos os campos.");
            }
        }
        else{
            const { description, amount, date } = Form.getValues(formType);
        
            if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ){
                throw new Error("Por favor, preencha todos os campos.");
            }
        }
    },
    //formatar os dados
    formatValues(formType) {
        if(formType == 'edit'){
            let {id, description, amount, date } = Form.getValues(formType);
        
            amount = Utils.formatAmount(amount);

            date = Utils.formatDate(date);

            return {
                id: id,
                description: description,
                amount: amount,
                date: date
            }
        }
        else {
            let { description, amount, date } = Form.getValues(formType);
        
            amount = Utils.formatAmount(amount);
    
            date = Utils.formatDate(date);
    
            return {
                description: description,
                amount: amount,
                date: date
            }
        }
       
    },
    //apagar os dados do formulário
    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event, formType) {
        event.preventDefault();

        try {
            //verificar se todas as informações foram preenchidas
            Form.validateFields(formType);
            console.log("---")
            //formatar os dados
            const transaction = Form.formatValues(formType);
            console.log(transaction)
            
            //salvar a transação
            if(formType == 'edit'){
                Transaction.edit(transaction)
            }
            else {
                Transaction.add(transaction);
            }
            // Transaction.add(transaction);
            //apagar os dados do formulário
            Form.clearFields();
            //modal feche
            Modal.close();
        } catch (error) {
            alert(error.message);
        } 
    }
}

const App = {
    init() {

        Transaction.all.forEach((transaction, index) => { 
            DOM.addTransaction(transaction, index);
        })

        DOM.updateBalance();

        Storage.set(Transaction.all);
   
    },
    reload() {
        DOM.clearTransaction();
        App.init();
    },
}

App.init();

// [
//     {
//         description: 'Luz',
//         amount: -50000,
//         date: '23/02/2021',
//     },
//     {
//         description: 'Website',
//         amount: 500000,
//         date: '23/02/2021',
//     },
//     {
//         description: 'Internet',
//         amount: -20000,
//         date: '23/02/2021',
//     },
//     {
//         description: 'App',
//         amount: 200000,
//         date: '23/02/2021',
//     },
// ],
