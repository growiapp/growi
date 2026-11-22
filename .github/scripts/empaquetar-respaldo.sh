#!/usr/bin/env bash
# Arma en DESTINO el sitio que estaba publicado antes de R3 (paquete de recuperación), desde un commit fijo y verificado.
# Uso: empaquetar-respaldo.sh SHA DESTINO
# - SHA debe ser un commit completo, ancestro de HEAD (por eso el checkout necesita fetch-depth: 0).
# - Extrae los blobs tal cual están en Git (sin conversión de fin de línea) y omite rutas ocultas, como hacía upload-pages-artifact@v3.
# - Verifica el resultado contra .github/recuperacion/pre-r3.sha256 (lista exacta de archivos y SHA-256).
set -euo pipefail
sha="${1:?falta el SHA}"; dest="${2:?falta el destino}"
manifiesto="$(cd "$(dirname "$0")/../recuperacion" && pwd)/pre-r3.sha256"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo "::error::SHA inválido: $sha" >&2; exit 1; }
git cat-file -e "$sha^{commit}" 2>/dev/null || { echo "::error::El commit $sha no está en el historial clonado (¿falta fetch-depth: 0?)" >&2; exit 1; }
git merge-base --is-ancestor "$sha" HEAD || { echo "::error::$sha no es ancestro de HEAD" >&2; exit 1; }
[[ ! -e "$dest" ]] || { echo "::error::El destino ya existe: $dest" >&2; exit 1; }
mkdir -p "$dest"
n=0
while IFS= read -r -d '' ruta; do
  case "/$ruta" in */.*) continue;; esac   # rutas ocultas (.github, .gitignore, …): no se publican
  mkdir -p "$dest/$(dirname "$ruta")"
  git cat-file blob "$sha:$ruta" > "$dest/$ruta"
  n=$((n + 1))
done < <(git ls-tree -r -z --name-only "$sha")
[[ -f "$dest/index.html" ]] || { echo "::error::El paquete no contiene index.html" >&2; exit 1; }
# lista exacta de archivos y hashes
diff <(cut -c67- "$manifiesto" | LC_ALL=C sort) <(cd "$dest" && find . -type f | sed 's|^\./||' | LC_ALL=C sort) >/dev/null \
  || { echo "::error::Los archivos del paquete no coinciden con el manifiesto" >&2; exit 1; }
(cd "$dest" && sha256sum --quiet -c "$manifiesto") || { echo "::error::Hash distinto del manifiesto" >&2; exit 1; }
echo "Paquete de recuperación verificado: $n archivos desde $sha"
