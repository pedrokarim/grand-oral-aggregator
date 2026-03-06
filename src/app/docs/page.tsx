import { BookOpen, Terminal, Settings, Sparkles, ExternalLink } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#E5E7E0]/30 dark:bg-[#2a2b2f]/30 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-[#8B5CF6]/10 p-3">
            <BookOpen className="h-8 w-8 text-[#8B5CF6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#23251D] dark:text-[#EAECF6]">
              Documentation
            </h1>
            <p className="text-[15px] text-[#9EA096]">
              Guides et ressources pour utiliser l&apos;application
            </p>
          </div>
        </div>
      </div>

      {/* Ollama guide */}
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#EB9D2A]" />
          <h2 className="text-lg font-semibold text-[#23251D] dark:text-[#EAECF6]">
            Installer Ollama pour le résumé IA local
          </h2>
        </div>

        <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] leading-relaxed">
          Ollama permet d&apos;exécuter des modèles de langage en local sur votre machine, sans clé API ni connexion internet.
          C&apos;est l&apos;option idéale pour générer des résumés IA gratuitement.
        </p>

        {/* Step 1 */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EB9D2A]/10 text-[#EB9D2A] text-[13px] font-bold">1</span>
            Télécharger Ollama
          </h3>
          <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] ml-8">
            Rendez-vous sur le site officiel et téléchargez la version Windows :
          </p>
          <a
            href="https://ollama.com/download/windows"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 ml-8 text-[14px] text-[#8B5CF6] hover:underline"
          >
            ollama.com/download/windows
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EB9D2A]/10 text-[#EB9D2A] text-[13px] font-bold">2</span>
            Installer
          </h3>
          <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] ml-8">
            Double-cliquez sur l&apos;installeur téléchargé et suivez les instructions. Ollama s&apos;installe en tant que service Windows.
          </p>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EB9D2A]/10 text-[#EB9D2A] text-[13px] font-bold">3</span>
            Lancer un modèle
          </h3>
          <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] ml-8">
            Ouvrez un terminal (PowerShell ou CMD) et exécutez :
          </p>
          <div className="ml-8 space-y-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#9EA096]" />
              <code className="text-[13px] bg-[#E5E7E0] dark:bg-[#2a2b2f] px-3 py-1.5 rounded-md text-[#23251D] dark:text-[#EAECF6] font-mono">
                ollama pull llama3
              </code>
            </div>
            <p className="text-[13px] text-[#9EA096]">
              Autres modèles disponibles : <code className="bg-[#E5E7E0] dark:bg-[#2a2b2f] px-1.5 py-0.5 rounded text-[12px]">mistral</code>, <code className="bg-[#E5E7E0] dark:bg-[#2a2b2f] px-1.5 py-0.5 rounded text-[12px]">phi3</code>, <code className="bg-[#E5E7E0] dark:bg-[#2a2b2f] px-1.5 py-0.5 rounded text-[12px]">gemma2</code>
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EB9D2A]/10 text-[#EB9D2A] text-[13px] font-bold">4</span>
            Configurer dans l&apos;application
          </h3>
          <div className="ml-8 space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#9EA096]" />
              <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096]">
                Allez dans <strong>Paramètres</strong> → onglet <strong>IA</strong>
              </p>
            </div>
            <ul className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] space-y-1 list-disc list-inside">
              <li>Provider : <strong>Ollama</strong></li>
              <li>Modèle : <strong>llama3</strong> (ou le modèle téléchargé)</li>
              <li>Base URL : <code className="bg-[#E5E7E0] dark:bg-[#2a2b2f] px-1.5 py-0.5 rounded text-[12px]">http://localhost:11434</code></li>
              <li>Pas besoin de clé API</li>
            </ul>
          </div>
        </div>

        {/* Step 5 */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EB9D2A]/10 text-[#EB9D2A] text-[13px] font-bold">5</span>
            Tester
          </h3>
          <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] ml-8">
            Ouvrez un sujet ou un article d&apos;actualité et cliquez sur le bouton <strong>Résumé IA</strong>.
            Le résumé sera généré localement par Ollama.
          </p>
        </div>

        {/* Reference link */}
        <div className="border-t border-[#D2D3CC] dark:border-[#3a3b3f] pt-4 mt-4">
          <p className="text-[13px] text-[#9EA096]">
            Documentation officielle :
          </p>
          <a
            href="https://docs.ollama.com/integrations/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#8B5CF6] hover:underline"
          >
            docs.ollama.com/integrations/claude-code
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
