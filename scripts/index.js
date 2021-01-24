const Modal = {
    open(){
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active")
    },
    close(){
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active")
    }
}