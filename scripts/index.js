const Modal = {
    open() {
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active")
    },
    close() {
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active")
    }
}
const UpdateTransactionModal = {
    open(index) {
        document
            .querySelector("#update-transaction-modal")
            .classList
            .add("active")
        document
            .querySelector("#update-transaction-form")
            .setAttribute("aria-modal-index", index)

        DOM.updateTransactionModal(index)
    },
    close() {
        document
            .querySelector("#update-transaction-modal")
            .classList
            .remove("active")
    }
}
const OpeningBalanceModal = {
    open() {
        document
            .querySelector("#opening-balance-modal")
            .classList
            .add("active")
    },
    close() {
        document
            .querySelector("#opening-balance-modal")
            .classList
            .remove("active")
    }
}

const CardColor = {
    positive() {
        document
            .querySelector(".card.total")
            .classList
            .remove("negative")
        document
            .querySelector(".card.total")
            .classList
            .add("positive")
    },
    negative() {
        document
            .querySelector(".card.total")
            .classList
            .remove("positive")
        document
            .querySelector(".card.total")
            .classList
            .add("negative")
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    getOpeningBalance() {
        return localStorage.getItem("dev.finances:openingBalance") || ""
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
    update(index, transaction) {
        let transactionList = Transaction.all

        if (transactionList) {
            if (transactionList[index]) {
                transactionList[index] = transaction
            }
        }

        Transaction.set(transactionList)
    },
    setOpeningBalance(openingBalance) {
        localStorage.setItem("dev.finances:openingBalance", openingBalance)
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    set(transactions) {
        Storage.set(transactions)
    },
    update(index, transaction) {
        Storage.update(index, transaction)

        App.reload()
    },
    addOpeningBalance(openingBalance) {
        Storage.setOpeningBalance(openingBalance.amount)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    incomes() { // Somar entradas
        let income = 0

        Transaction.all.forEach(transaction => {
            if (transaction.deposit) {
                if (transaction.amount > 0) {
                    income += transaction.amount
                }
            }
        })
        return income
    },
    expenses() { // Somar saídas
        let expense = 0

        Transaction.all.forEach(transaction => {
            if (transaction.deposit) {
                if (transaction.amount < 0) {
                    expense += transaction.amount
                }
            }
        })
        return expense
    },
    total() { // Entradas menos saídas mais saldo inicial
        return Transaction.incomes() + Transaction.expenses() + Number(Storage.getOpeningBalance())
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transactions, index) {
        const deposit = transactions.deposit ? "deposit-activated" : "deposit-not-activated"

        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
        tr.classList.add(`${deposit}`)
        tr.dataset.index = index
        // tr.onclick = () => UpdateTransactionModal.open(index)

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transactions, index) {
        const CSSclass = transactions.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transactions.amount)
        const UpdateTransactionModal_func = `UpdateTransactionModal.open(${index})`
        const html = `
        <td onClick="${UpdateTransactionModal_func}" class="description">${transactions.description}</td>
        <td onClick="${UpdateTransactionModal_func}" class="${CSSclass}">${amount}</td>
        <td onClick="${UpdateTransactionModal_func}" class="date">${transactions.date}</td>
        <td onclick="Transaction.remove(${index})" class="center-item">
            <img src="./assets/minus.svg" class="remove" alt="Remover Transação">
        </td>
        `
        return html
    },
    updateTransactionModal(index) {
        const {description, amount, date, deposit} = Transaction.all[index]
        console.log(date)

        document
            .querySelector("#update-description")
            .value = description
        document
            .querySelector("#update-amount")
            .value = Utils.formatSimpleAmountToText(String(amount))
        document
            .querySelector("#update-date")
            .value = Utils.unFormatDate(date)
        document
            .querySelector("#update-deposit")
            .checked = deposit
    },
    updateOpeningBalance() {
        document
            .querySelector("#openingBalanceDisplay")
            .innerHTML = Utils.formatCurrency(Storage.getOpeningBalance())
        document
            .querySelector("#opening-balance-amount")
            .value = Utils.formatSimpleAmountToText(Storage.getOpeningBalance())
    },
    updateBalance() {
        document
            .querySelector("#incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .querySelector("#expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .querySelector("#totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    totalCardColor(){
        if (Transaction.total() < 0) {
            // - Negativo
            console.info("Seu Valor Total Esta Negativo: " + Utils.formatSimple(Transaction.total()))
            CardColor.negative()
        } else {
            // - Positivo
            console.info("Seu Valor Total Esta Positivo: " + Utils.formatSimple(Transaction.total()))
            CardColor.positive()
        }
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-&nbsp;" : "+&nbsp;"

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })

        return signal + value
    },
    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },
    formatSimpleAmountToText(value) {
        const decimalPlace = value.slice(-2)
        const integer = value.slice(0, -2)

        const formattedAmount = `${integer}.${decimalPlace}`

        return formattedAmount
    },
    formatSimple(value){
        const signal = Number(value) < 0 ? "- " : "+ "

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })

        return signal + value
    },
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    unFormatDate(date) {
        const splittedDate = date.split("/")
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount:      document.querySelector("input#amount"),
    date:        document.querySelector("input#date"),
    deposit:     document.querySelector("input#deposit"),
    getValues() {
        return {
            description: Form.description.value,
            amount:      Form.amount.value,
            date:        Form.date.value,
            deposit:     Form.deposit.checked
        }
    },
    validateFields() {
        const {description, amount, date} = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },
    formatValues() {
        let {description, amount, date, deposit} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
            deposit
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value      = ""
        Form.date.value        = ""
        Form.deposit.checked   = true
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()                   // Verifica campos
            const transaction = Form.formatValues() // Formata valores
            Form.saveTransaction(transaction)       // Adiciona valores
            Form.clearFields()                      // Limpa campos

            Modal.close()                           // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
            //alert(error.message)
        }
    }
}
const UpdateTransactionForm = {
    description: document.querySelector("input#update-description"),
    amount:      document.querySelector("input#update-amount"),
    date:        document.querySelector("input#update-date"),
    deposit:     document.querySelector("input#update-deposit"),
    getValues() {
        return {
            description: UpdateTransactionForm.description.value,
            amount:      UpdateTransactionForm.amount.value,
            date:        UpdateTransactionForm.date.value,
            deposit:     UpdateTransactionForm.deposit.checked
        }
    },
    validateFields() {
        const {description, amount, date} = UpdateTransactionForm.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },
    formatValues() {
        let {description, amount, date, deposit} = UpdateTransactionForm.getValues()

        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
            deposit
        }
    },
    saveTransaction(index, transaction) {
        Transaction.update(index, transaction)
    },
    submit(event) {
        event.preventDefault()
        const modalIndex = document
            .querySelector("#update-transaction-form")
            .getAttribute("aria-modal-index")

        try {
            UpdateTransactionForm.validateFields()                         // Verifica campos
            const transaction = UpdateTransactionForm.formatValues()       // Formata valores
            UpdateTransactionForm.saveTransaction(modalIndex, transaction) // Adiciona valores
            UpdateTransactionModal.close()                                 // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
        }
    }
}
const OpeningBalanceForm = {
    amount: document.querySelector("input#opening-balance-amount"),
    getValues() {
        return {
            amount: OpeningBalanceForm.amount.value
        }
    },
    validateFields() {
        const {amount} = OpeningBalanceForm.getValues()

        if (amount.trim() === "") {
            throw new Error("Por favor, preencha o campo!")
        }
    },
    formatValues() {
        let {amount} = OpeningBalanceForm.getValues()

        amount = Utils.formatAmount(amount)

        return {
            amount
        }
    },
    saveOpeningBalance(openingBalance) {
        Transaction.addOpeningBalance(openingBalance)
    },
    submit(event) {
        event.preventDefault()

        try {
            OpeningBalanceForm.validateFields()                      // Verifica campos
            const openingBalance = OpeningBalanceForm.formatValues() // Formata valores
            OpeningBalanceForm.saveOpeningBalance(openingBalance)    // Adiciona valores

            OpeningBalanceModal.close()                              // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
        }
    }
}


const App = {
    init() {
        /* Transaction.all.forEach((transactions, index) => {
            DOM.addTransaction(transactions, index)
        })
         ou ↓ */
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateOpeningBalance()  // Atualiza o valor do saldo inicial
        DOM.updateBalance()         // Atualiza o valor dos cards
        DOM.totalCardColor()        // Atualiza a cor do card 'total'

        Storage.setOpeningBalance(Storage.getOpeningBalance())
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}
App.init()



function toastError(message = "ERRO!") {
    /*let a = document.querySelector("???").innerHTML = `
    <div id="toast">
    <div class="img">Icon</div>
    <div class="description">${message}</div>
    </div>`*/

    const toastId = document.querySelector("#toast")
    toastId.className = "show"

    setTimeout(() => {
        toastId.className = toastId.className.replace("show", "")
    }, 5000)
}