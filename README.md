# Smart Travel Safety - Prototype

This is a prototype for the "Smart Travel Safety" Progressive Web App (PWA), designed to enhance tourist safety through real-time monitoring and emergency response. This prototype was built for a hackathon-style presentation.

## Core Features Implemented

*   **Tourist Registration:** Users can register for an account.
*   **Live GPS Tracking:** The tourist dashboard tracks the user's location in real-time and displays it on a map.
*   **Panic Button:** A prominent panic button allows tourists to send an emergency alert.
*   **Authority Dashboard:** A separate dashboard for authorities displays the real-time location of all tourists, highlighting those who have triggered an emergency alert.
*   **Real-time System:** The entire system is connected in real-time using Supabase subscriptions.

## Tech Stack

*   **Frontend:** React 18+ with TypeScript, Vite, and Tailwind CSS.
*   **Backend:** Supabase (Authentication, PostgreSQL Database, Real-time Subscriptions).
*   **Maps:** Leaflet and React-Leaflet.

## Getting Started

Follow these instructions to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

The project uses Supabase for its backend. You will need to create a Supabase project and get your API URL and anon key.

1.  Create a `.env` file in the root of the project.
2.  Add your Supabase credentials to the `.env` file like this:

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

    Replace `"YOUR_SUPABASE_URL"` and `"YOUR_SUPABASE_ANON_KEY"` with your actual Supabase project credentials.

### 4. Set Up the Database

You need to create a `locations` table in your Supabase database. You can do this by running the following SQL query in the Supabase SQL Editor:

```sql
-- Create the locations table
CREATE TABLE public.locations (
  user_id uuid NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'safe'::text,
  CONSTRAINT locations_pkey PRIMARY KEY (user_id),
  CONSTRAINT locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own location
CREATE POLICY "Allow individual insert access"
ON public.locations
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own location
CREATE POLICY "Allow individual update access"
ON public.locations
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow all users (including authorities) to read all locations
CREATE POLICY "Allow all read access"
ON public.locations
FOR SELECT USING (true);

-- Enable real-time on the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
```

### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

**Note on potential environment issues:** Some environments may have trouble running `npm` executables directly (e.g., `vite`). If `npm run dev` fails, you may need to call the executable directly from the `node_modules` folder, although this was found to be unreliable in some sandboxed environments.
