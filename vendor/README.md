# `@quantia/contracts`

Tarball vendored de `@quantia/contracts@0.7.0` (`file:vendor/quantia-contracts-0.7.0.tgz`).
El paquete es privado en el monorepo `Quantia_API/packages/contracts`; no hay registry.

Para regenerarlo cuando suba la API:

```bash
cd ../Quantia_API/packages/contracts
npm run build
# Empaquetar solo dist (dist está en .gitignore del monorepo).
rm -rf /tmp/quantia-contracts-pack
mkdir -p /tmp/quantia-contracts-pack/dist
cp package.json /tmp/quantia-contracts-pack/package.json
cp -R dist/. /tmp/quantia-contracts-pack/dist/
cd /tmp/quantia-contracts-pack
npm pkg set files='["dist"]'
npm pkg delete scripts devDependencies
npm pack --pack-destination /ruta/a/Quantia/vendor
```

Sustituye la dependencia en `package.json` si cambia el nombre del archivo.
