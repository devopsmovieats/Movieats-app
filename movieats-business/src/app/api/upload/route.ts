// DEPLOY PRODUÇÃO R2 - ESTRUTURA FINALIZADA (FORCE PUSH)
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Log solicitado para conferência do Bucket
    console.log("Bucket:", process.env.R2_BUCKET_NAME);

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      forcePathStyle: false,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const formData = await request.formData();
    
    // Log detalhado do FormData para depuração exaustiva
    console.log('--- DEBUG UPLOAD: DADOS RECEBIDOS ---');
    const formDataEntries = Array.from(formData.entries());
    formDataEntries.forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`Campo: ${key} | Tipo: Arquivo | Nome: ${value.name} | Tamanho: ${value.size} bytes`);
      } else {
        console.log(`Campo: ${key} | Valor: ${value}`);
      }
    });

    // Verificação de presença de variáveis de ambiente no Runtime
    console.log('--- DEBUG UPLOAD: AMBIENTE ---');
    console.log('R2_ENDPOINT:', !!process.env.R2_ENDPOINT);
    console.log('R2_ACCESS_KEY_ID:', !!process.env.R2_ACCESS_KEY_ID);
    console.log('R2_SECRET_ACCESS_KEY:', !!process.env.R2_SECRET_ACCESS_KEY);
    console.log('Bucket presente:', !!process.env.R2_BUCKET_NAME);
    console.log('NEXT_PUBLIC_R2_PUBLIC_URL:', !!process.env.NEXT_PUBLIC_R2_PUBLIC_URL);

    const file = formData.get('file') as File;

    if (!file) {
      console.error('ERRO: Campo "file" não encontrado no FormData');
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Busca dinâmica do nome do cliente para o Path do R2
    const establishmentId = formData.get('establishment_id') || formData.get('establishmentId');
    let clientFolder = 'Geral';

    if (establishmentId && establishmentId !== 'unknown') {
      const { data: config } = await supabase
        .from('bd_config_estabelecimento')
        .select('nome_loja')
        .eq('id', establishmentId)
        .single();
      
      if (config?.nome_loja) {
        clientFolder = config.nome_loja;
      }
    }

    const filename = file.name;
    const filePath = `clientes/${clientFolder}/categorias/${filename}`;

    console.log('Caminho Final no R2:', filePath);

    const bucketName = process.env.R2_BUCKET_NAME || 'movieats-prod';

    const uploadParams = {
      Bucket: bucketName!,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    };

    try {
      console.log(`Tentando upload para o bucket: ${bucketName}`);
      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (s3Error: any) {
      console.error('--- ERRO CRÍTICO CLOUDFLARE R2 ---');
      console.error('R2 Error Details:', s3Error);
      console.error('Bucket Tentado:', bucketName);
      console.error('Mensagem:', s3Error.message);
      console.error('Código:', s3Error.Code || s3Error.name);
      
      return NextResponse.json({ 
        error: 'R2 rejection', 
        details: s3Error.message,
        code: s3Error.Code || s3Error.name 
      }, { status: 500 });
    }

    // URL pública construída com a variável de ambiente necessária
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL!}/${filePath}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('--- ERRO FATAL API UPLOAD ---', error);
    return NextResponse.json({ 
      error: 'API_UPLOAD_ERROR',
      message: error.message,
      code: error.Code || error.name || '500',
      details: error.stack
    }, { status: 500 });
  }
}
