from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2

from detector import detect_signal
from esp32_control import send_to_esp32

app = Flask(__name__)
CORS(app)

camera = cv2.VideoCapture(0)

current_color = "NONE"
emergency_flag = False


def generate_frames():
    global current_color, emergency_flag

    while True:
        success, frame = camera.read()
        if not success:
            break

        color = detect_signal(frame)
        current_color = color

        if emergency_flag:
            if color == "GREEN":
                send_to_esp32("MOVE")
            elif color == "RED":
                send_to_esp32("STOP")

            emergency_flag = False

        cv2.putText(frame, color, (150, 200),
                    cv2.FONT_HERSHEY_SIMPLEX, 3, (0,255,0), 5)

        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/')
def home():
    return "🚀 Backend Running"


@app.route('/video')
def video():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/status')
def status():
    return jsonify({"signal": current_color})


@app.route('/trigger_emergency', methods=['POST'])
def trigger():
    global emergency_flag
    emergency_flag = True
    return {"message": "Emergency Triggered"}


if __name__ == "__main__":
    app.run(debug=True)