// DEPLOY PRODUÇÃO R2 - ESTRUTURA FINALIZADA (FORCE PUSH)
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  try {
    // Configuração do cliente S3 para Cloudflare R2 movida para dentro da função (Bypass Build Check)
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // R2 Path: {establishment_id}/categorias/{filename}
    const establishment_id = formData.get('establishmentId') || 'unknown';
    const filename = file.name;
    const filePath = `${establishment_id}/categorias/${filename}`;

    const uploadParams = {
      // Bypass: Variáveis de ambiente são acessadas diretamente sem validação de bloqueio de build
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // A URL pública depende de como o bucket está configurado
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${filePath}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Erro no upload R2:', error);
    return NextResponse.json({ error: 'Erro interno ao processar upload' }, { status: 500 });
  }
}
