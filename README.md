# FeelScope

✨ FeelScope is a smart little web app that reads your text (or Reddit posts) and tells you how it feels — mood, emotion, and topic. 📊💭💜

---

## 🚀 Installation

### 1. Clone the repo

- Clone the project from GitHub:  
  `git clone https://github.com/sakNADA/FeelScope.git`  
  `cd FeelScope`

---

### 2. Backend Setup (Flask + Ollama/Mistral)

In **Terminal 1**:

- Navigate to the backend folder:
  `cd feelscope-dashboard` 
  `cd backend`

- Create and activate a virtual environment:
  - On Windows:  
    `python -m venv venv`  
    `venv\Scripts\activate`
  - On macOS/Linux:  
    `source venv/bin/activate`

- Install dependencies:  
  `pip install -r requirements.txt`

- Run the Flask backend:  
  `python app.py`

✅ **Make sure:**
- Python 3.9+ is installed  
- MongoDB is installed and running  
- **MongoDB Compass** is installed and connected  
- Ollama with the `mistral` model is running in a separate terminal:  
  `ollama run mistral`

---

### 3. Frontend Setup (React)

In **Terminal 2**:

- Navigate to the frontend folder:  
  `cd feelscope-dashboard`

- Install dependencies:  
  `npm install`

- Run the frontend:  
  `npm run start`

---

## 💡 Features

- 📥 Analyze manual text or Reddit posts  
- 🧠 Detect sentiment (positive, negative, neutral)  
- ❤️ Detect emotions and mood  
- 🗂 View past analyses in the history  
- 📊 Visualize data in charts  
- 🌙 Dark mode toggle  
- 📎 Export data to CSV  
- 🔒 User authentication (optional)  
- ⚙️ Admin/worker dashboard support  

---

## 🛠 Tech Stack

- **Frontend:** React.js + Bootstrap  
- **Backend:** Flask (Python)  
- **AI Models:** Ollama + Mistral, TextBlob fallback  
- **Database:** MongoDB (via PyMongo)  
- **Others:** Recharts, Chart.js, LocalStorage  

---

## 📸 Screenshots

<img width="945" height="462" alt="image" src="https://github.com/user-attachments/assets/39415a2b-1ce5-45a8-a41e-0e4ab82a2d0c" />
<img width="945" height="458" alt="image" src="https://github.com/user-attachments/assets/2cb95db1-91b5-42f2-b93c-65a7250214ac" />
<img width="945" height="458" alt="image" src="https://github.com/user-attachments/assets/52806f30-1d7d-4e07-8c83-146a5585436d" />
<img width="945" height="456" alt="image" src="https://github.com/user-attachments/assets/424aef21-116e-4495-a962-479a4a0ed2c8" />
<img width="945" height="458" alt="image" src="https://github.com/user-attachments/assets/77e8d14b-1490-4289-b79a-26ad8c500400" />
<img width="945" height="457" alt="image" src="https://github.com/user-attachments/assets/5c803c3e-f30e-4945-bf7e-fa19bf2f1e65" />

---

## ✨ Credits

Built with 💜 by **sakNADA** and **Ajana Mohamed Amine**  
Project mentors: **Mme Ghazal Ikram (Encadrante)**, **Mr. Tarik Jahid (Jury Member)**

---

## 📬 Feedback & Contributions

Feel free to open issues or pull requests.  
— let’s improve it together!

---

## 📄 License

This project is licensed under the MIT License.
