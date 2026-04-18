// DEPLOY PRODUÇÃO R2 - ESTRUTURA FINALIZADA (FORCE PUSH)
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  try {
    // Configuração do cliente S3 para Cloudflare R2 movida para dentro da função (Bypass Build Check)
    // Validação de variáveis de ambiente básicas para log
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
      console.error('--- R2 CONFIG ERROR ---');
      console.error('Variáveis de ambiente do R2 estão incompletas no runtime.');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('Erro Upload: Arquivo não encontrado no FormData');
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // R2 Path: {establishment_id}/categorias/{filename}
    const establishment_id = formData.get('establishment_id') || formData.get('establishmentId') || 'unknown';
    const filename = file.name;
    const filePath = `${establishment_id}/categorias/${filename}`;

    console.log('--- Processando Upload R2 ---');
    console.log('ID Estabelecimento:', establishment_id);
    console.log('Arquivo:', filename);
    console.log('Caminho Final:', filePath);

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
      console.error('Bucket Tentado:', bucketName);
      console.error('Mensagem:', s3Error.message);
      console.error('Código:', s3Error.Code || s3Error.name);
      console.error('Detalhes Completos:', JSON.stringify(s3Error, null, 2));
      
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
    console.error('Erro de Processamento API:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
