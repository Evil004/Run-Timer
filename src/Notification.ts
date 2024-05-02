class NotificationManager{
    static setErrorNotification(message: string){
        this.removeNotification()
        ELEMENTS.notificationMessage.innerText = message;
        ELEMENTS.notificationMessage.classList.add("error");
    }

    static setInfoNotification(message: string){
        this.removeNotification()

        ELEMENTS.notificationMessage.innerText = message;
        ELEMENTS.notificationMessage.classList.add("info");

    }

    static setSuccessNotification(message: string){
        this.removeNotification()

        ELEMENTS.notificationMessage.innerText = message;
        ELEMENTS.notificationMessage.classList.add("success");

    }

    static removeNotification(){
            ELEMENTS.notificationMessage.innerText = "";
            ELEMENTS.notificationMessage.classList.remove("error");
            ELEMENTS.notificationMessage.classList.remove("info");
            ELEMENTS.notificationMessage.classList.remove("success");

    }

    static showWarningModal(message:string): Promise<boolean>{
        ELEMENTS.warningModal.querySelector("#modal-content")!.textContent = message;

        ELEMENTS.warningModal.style.visibility = "visible";
        ELEMENTS.lock.style.visibility = "visible";


        return new Promise((resolve)=>{
            ELEMENTS.warningModal.querySelector("#warning-yes-btn")!.addEventListener("click",()=>{
                resolve(true);
                ELEMENTS.warningModal.style.visibility = "hidden";
                ELEMENTS.lock.style.visibility = "hidden";
            });

            ELEMENTS.warningModal.querySelector("#warning-no-btn")!.addEventListener("click",()=>{
                resolve(false);
                ELEMENTS.warningModal.style.visibility = "hidden";
                ELEMENTS.lock.style.visibility = "hidden";
            });



            return true
        })
    }

}