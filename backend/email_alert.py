import yagmail

def send_email_alert():
    try:
        yag = yagmail.SMTP("darshannnaikdarshannnaik@gmail.com", "1983Deepa")
        yag.send(
            to="receiver@gmail.com",
            subject="🚨 Ambulance Alert",
            contents="Ambulance detected! Traffic priority activated."
        )
        print("Email Sent")
    except Exception as e:
        print("Email Error:", e)