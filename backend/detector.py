import cv2
import numpy as np

def detect_signal(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    lower_red = np.array([0, 120, 70])
    upper_red = np.array([10, 255, 255])

    lower_green = np.array([40, 40, 40])
    upper_green = np.array([90, 255, 255])

    lower_yellow = np.array([15, 150, 150])
    upper_yellow = np.array([35, 255, 255])

    if cv2.countNonZero(cv2.inRange(hsv, lower_red, upper_red)) > 500:
        return "RED"
    elif cv2.countNonZero(cv2.inRange(hsv, lower_green, upper_green)) > 500:
        return "GREEN"
    elif cv2.countNonZero(cv2.inRange(hsv, lower_yellow, upper_yellow)) > 500:
        return "YELLOW"
    return "NONE"