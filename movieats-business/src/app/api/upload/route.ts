// DEPLOY PRODUÇÃO R2 - ESTRUTURA FINALIZADA (FORCE PUSH)
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const establishmentId = formData.get('establishment_id') || formData.get('establishmentId');
    let clientFolder = 'Geral';

    if (establishmentId && establishmentId !== 'unknown') {
      const { data: config } = await supabase
        .from('bd_config_estabelecimento')
        .select('nome_loja')
        .eq('id', establishmentId)
        .single();
      
      if (config?.nome_loja) {
        clientFolder = config.nome_loja.trim();
        // Normalização garantida: Villa Gourmet (com dois L)
        if (clientFolder.toLowerCase().includes('vila gourmet')) {
          clientFolder = 'Villa Gourmet';
        }
      }
    }

    const folder = (formData.get('folder') as string) || 'categorias';
    const filename = file.name;
    const filePath = `clientes/${clientFolder}/${folder}/${filename}`;

    const bucketName = process.env.R2_BUCKET_NAME || 'movieats-prod';

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    }));

    const publicUrl = `https://cdn.movieats.com.br/${filePath}`;
    return NextResponse.json({ success: true, url: publicUrl }, { status: 200 });

  } catch (error: any) {
    console.error('Erro no POST upload:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Erro interno no upload'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL necessária' }, { status: 400 });
    }

    const filePath = url.replace('https://cdn.movieats.com.br/', '')
                        .replace('https://cdn.softcloudba.com/', '');

    const bucketName = process.env.R2_BUCKET_NAME || 'movieats-prod';

    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    }));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no DELETE upload:', error);
    return NextResponse.json({ success: true, warning: 'Ignorado' }, { status: 200 });
  }
}

