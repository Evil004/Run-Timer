class NotificationManager{
    private static recentlySetNotification: boolean = false;
    static setErrorNotification(message: string){
        ELEMENTS.notificationMessage.innerText = message;
        ELEMENTS.notificationMessage.classList.add("error");
        this.recentlySetNotification = true;
    }

    static setInfoNotification(message: string){
        ELEMENTS.notificationMessage.innerText = message;
        ELEMENTS.notificationMessage.classList.add("info");
        this.recentlySetNotification = true;

    }

    static setSuccessNotification(message: string){
        ELEMENTS.notificationMessage.innerText = message;
        ELEMENTS.notificationMessage.classList.add("success");
        this.recentlySetNotification = true;

    }

    static removeNotification(){
        if (!this.recentlySetNotification){
            ELEMENTS.notificationMessage.innerText = "";
            ELEMENTS.notificationMessage.classList.remove("error");
            ELEMENTS.notificationMessage.classList.remove("info");
            ELEMENTS.notificationMessage.classList.remove("success");
        }

        this.recentlySetNotification = false;

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