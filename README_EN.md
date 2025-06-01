# 🧪 Technical Test – Backend Developer (Senior)

## 🛍️ Context

This test simulates the development of a module to manage a portfolio of **registered trademarks** and associate them with **proof-of-use documents**. These documents must be **automatically classified** by type and used to compute a **“probative strength” score** for each trademark.

The test combines **domain modeling**, **API design**, **algorithmic logic**, and **code quality**. It is expected to take **3 to 4 hours**.

---

## 🌟 Objectives

Develop an API that allows to:

- Manage trademarks
- Add proof-of-use documents
- Automatically classify documents by legal type
- Calculate a probative strength score (out of 100) for each trademark

---

## 🧱 Models

### 🏷️ Trademark

- `id`
- `name`
- `registration_date`

### 📄 Document

- `id`
- `title`
- `mime_type` (e.g., `application/pdf`)
- `content` (simulated or extracted plain text)
- `document_date` (issue date of the document)
- `type` (automatically determined)
- `trademark_id` (reference to the associated trademark)

> ⚠️ Documents are **not real files**: they are **structured representations** (e.g., JSON) with simulated content.

---

## 🧠 Automatic Classification

Each document is automatically classified into one of the following types:

- `invoice`
- `advertisement`
- `product`
- `legal`
- `other`

### 🔎 Rules

Each type has an associated list of keywords.  
Each keyword found in the document's `title` or `content` adds **+5 points**.

| Type         | Keywords (in `title` or `content`)                 |
|--------------|----------------------------------------------------|
| invoice      | `facture`, `invoice`, `HT`, `TTC`, `TVA`           |
| advertisement| `pub`, `publicité`, `campagne`, `affiche`          |
| product      | `produit`, `catalogue`, `offre`, `référence`       |
| legal        | `contrat`, `procès`, `litige`, `inpi`              |

- The type with the **highest score** is selected
- If no type reaches **10 points**, it is classified as `other`

> ⚠️ A document is only valid if the **trademark name appears in its content**

---

## 📊 Probative Strength Score (out of 100)

Each trademark is scored out of 100 based on three criteria:

### 1. ✅ Presence of Key Document Types (max 40 points)

Give **+10 points** for each of the following types present at least once:

- `invoice`
- `advertisement`
- `product`
- `legal`

→ max: **40 points**  
The `other` type gives **0 points**


### 2. 📅 Time Coverage (max 30 points)

- Compute the number of **calendar years** between `date_depot` and today (inclusive)
- Spread the **30 points** across those years
- Give points based on the number of **distinct years covered** by documents

> Example:  
> 4 years since registration, 2 years covered → (2/4) × 30 = **15 points**


### 3. 📦 Document Volume (max 30 points)

- **+2 points per document**, up to a maximum of **15 documents**

> → 8 documents = 16 points  
> → 20 documents = **30 points max**

### ✅ Final Score

```txt
score = key_documents + time_coverage + document_count
```

---

## ⚙️ Technical Requirements

- Backend server (Node.js/TypeScript recommended, but up to you)
- You are **free to define your own API routes**
- No authentication required
- Simple database (SQLite, JSON file, or in-memory)
- Tests required

---

## 🌱 Bonus (optional)

- Lightweight interface (Frontend, Swagger, Postman...) to test the API

---

## 🔍 Evaluation Criteria

We will evaluate:

- Your ability to **model domain logic** in a clean and maintainable way
- The **correctness and clarity** of your algorithms
- The **structure, readability, and modularity** of your code
- The quality and coverage of your **tests**
- Your **technical choices** and how you document or explain them

---

## 🧩 Open Decisions

Some parts of the test are **deliberately left open-ended**.

Please make your own decisions and **explain them clearly** in your README or code.
