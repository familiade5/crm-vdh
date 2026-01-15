import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface PropertyImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  propertyId?: string;
}

export function PropertyImageUpload({ images, onChange, propertyId }: PropertyImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId || 'temp'}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é maior que 5MB`);
          continue;
        }

        const url = await uploadImage(file);
        newImages.push(url);
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
        toast.success(`${newImages.length} imagem(ns) enviada(s)!`);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    const fileName = imageUrl.split('/').pop();

    if (fileName) {
      await supabase.storage
        .from('property-images')
        .remove([fileName]);
    }

    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
    toast.success('Imagem removida');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">Fotos do Imóvel</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Fotos
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Clique para adicionar fotos ou arraste arquivos aqui
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG ou WEBP até 5MB cada
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
          <div
            className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
