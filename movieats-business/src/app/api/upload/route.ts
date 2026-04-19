// DEPLOY PRODUÇÃO R2 - ESTRUTURA FINALIZADA (FORCE PUSH)
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  try {
    // Verificação estrita de Nomes de Variáveis conforme solicitado (Vercel Dashboard)
    const requiredEnvs = ['R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

    if (missingEnvs.length > 0) {
      console.error('--- ERRO DE CONFIGURAÇÃO VERCEL ---');
      console.error('Variáveis ausentes:', missingEnvs.join(', '));
      return NextResponse.json({ 
        error: 'Variáveis de ambiente do R2 estão incompletas',
        missing: missingEnvs 
      }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env['R2_ENDPOINT']!,
      credentials: {
        accessKeyId: process.env['R2_ACCESS_KEY_ID']!,
        secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
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
    console.log('R2_ENDPOINT:', !!process.env['R2_ENDPOINT']);
    console.log('R2_ACCESS_KEY_ID:', !!process.env['R2_ACCESS_KEY_ID']);
    console.log('R2_SECRET_ACCESS_KEY:', !!process.env['R2_SECRET_ACCESS_KEY']);
    console.log('Bucket:', process.env['R2_BUCKET_NAME'] ? "OK" : "VAZIO");
    console.log('NEXT_PUBLIC_R2_PUBLIC_URL:', !!process.env['NEXT_PUBLIC_R2_PUBLIC_URL']);

    const file = formData.get('file') as File;

    if (!file) {
      console.error('ERRO: Campo "file" não encontrado no FormData');
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // R2 Path: {establishment_id}/categorias/{filename}
    const establishment_id = formData.get('establishment_id') || formData.get('establishmentId') || 'unknown';
    const filename = file.name;
    const filePath = `${establishment_id}/categorias/${filename}`;

    console.log('Caminho Final no R2:', filePath);

    const bucketName = process.env['R2_BUCKET_NAME'] || 'movieats-prod';

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
    const publicUrl = `${process.env['NEXT_PUBLIC_R2_PUBLIC_URL']!}/${filePath}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Erro de Processamento API:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
