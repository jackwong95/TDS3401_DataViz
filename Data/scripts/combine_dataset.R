setwd("A:/ProgramFiles/XAMPP/htdocs/data_viz/Data")

combine_src <- function(file_name, source_name)
{
  df <- read.csv(file_name, sep ="\t", quote="", header = FALSE)
  df$v3 <- rep(source_name, nrow(amazon))
  names(df) <- c("text", "sentiment", "source")
  df
}

amazon_df <- combine_src("amazon_cells_labelled.tsv", "amazon")
imbd_df <- combine_src("imdb_labelled.tsv", "imbd")
yelp_df <- combine_src("yelp_labelled.tsv", "yelp")

df <- rbind(amazon_df, rbind(imbd_df, yelp_df))
write.csv(df, "data.csv", row.names = FALSE)