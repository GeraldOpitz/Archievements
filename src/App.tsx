import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">

      <div className="w-[700px] p-10 rounded-3xl bg-slate-800 shadow-2xl">

        <div className="flex items-center gap-4 mb-8">

          <Trophy size={40} />

          <div>
            <h1 className="text-4xl font-bold">
              Archivements
            </h1>

            <p className="text-slate-400">
              Universal achievement engine
            </p>
          </div>

        </div>

        <motion.button
          whileHover={{ scale:1.05 }}
          whileTap={{ scale:0.97 }}
          className="
            px-8 py-4
            rounded-2xl
            bg-yellow-500
            text-black
            font-bold
          "
        >
          Simular logro legendario
        </motion.button>

      </div>

    </main>
  );
}
