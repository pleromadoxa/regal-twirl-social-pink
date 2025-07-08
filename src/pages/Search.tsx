
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';

const Search = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-6xl mx-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Search</h1>
            <p className="text-gray-600 dark:text-gray-300">Find users and content</p>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Search;
