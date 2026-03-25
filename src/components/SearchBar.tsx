import { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const { searchQuery, setSearchQuery, searchOpen, setSearchOpen } = useAppContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, setSearchOpen, setSearchQuery]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="shrink-0 border-b bg-card px-4 py-2 flex items-center gap-2">
      <Input
        ref={inputRef}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Buscar atividades..."
        className="h-8 text-xs flex-1"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
